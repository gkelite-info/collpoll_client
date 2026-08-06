"use server";

import { createClient } from "@supabase/supabase-js";

export type UnitTopicProgress = {
  id: number; // collegeSubjectUnitTopicId
  isCompleted: boolean;
};

export async function saveUnitProgress(
  unitId: number,
  percentage: number,
  topics: UnitTopicProgress[],
  collegeSectionId?: number
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const now = new Date().toISOString();

  try {
    // 1. Fetch the unit to check if it's global
    const { data: unit, error: unitCheckError } = await supabase
      .from("college_subject_units")
      .select("*")
      .eq("collegeSubjectUnitId", unitId)
      .single();

    if (unitCheckError) {
      throw new Error("Unit not found");
    }

    if (unit.collegeSectionsId === null && collegeSectionId) {
      // --- COPY-ON-WRITE PATH ---
      // This is a global unit. We must clone it, its topics, and resources for this specific section.

      // a. Clone the Unit or fetch existing clone
      let newUnitId: number;
      const { data: newUnit, error: newUnitError } = await supabase
        .from("college_subject_units")
        .insert({
          unitNumber: unit.unitNumber,
          unitTitle: unit.unitTitle,
          startDate: unit.startDate,
          endDate: unit.endDate,
          collegeSubjectId: unit.collegeSubjectId,
          collegeId: unit.collegeId,
          collegeSectionsId: collegeSectionId,
          createdBy: unit.createdBy,
          createdAt: now,
          updatedAt: now,
          completionPercentage: percentage,
          isActive: true
        })
        .select()
        .single();

      if (newUnitError) {
        if (newUnitError.code === "23505") {
          // Unit was already cloned (possibly orphaned). Recover it.
          const { data: existingClone } = await supabase
            .from("college_subject_units")
            .select("collegeSubjectUnitId")
            .eq("collegeId", unit.collegeId)
            .eq("collegeSubjectId", unit.collegeSubjectId)
            .eq("unitNumber", unit.unitNumber)
            .eq("collegeSectionsId", collegeSectionId)
            .single();
            
          if (existingClone) {
            newUnitId = existingClone.collegeSubjectUnitId;
          } else {
            console.error("Failed to recover cloned global unit:", newUnitError);
            throw new Error("Unable to save progress for this section. Please try again.");
          }
        } else {
          console.error("Failed to clone global unit:", newUnitError);
          throw new Error("Unable to save progress for this section. Please try again.");
        }
      } else {
        newUnitId = newUnit.collegeSubjectUnitId;
      }
      
      // Update completion percentage on the cloned unit
      await supabase.from("college_subject_units").update({ completionPercentage: percentage }).eq("collegeSubjectUnitId", newUnitId);

      // b. Fetch all old topics
      const { data: oldTopics, error: oldTopicsError } = await supabase
        .from("college_subject_unit_topics")
        .select("*")
        .eq("collegeSubjectUnitId", unitId)
        .eq("isActive", true);
        
      if (oldTopicsError) throw new Error("Failed to fetch global topics");

      const oldTopicIds = oldTopics.map(t => t.collegeSubjectUnitTopicId);

      // c. Insert cloned topics or update if they already exist
      const topicsToInsert = oldTopics.map((ot, idx) => {
        const incoming = topics.find(t => t.id === ot.collegeSubjectUnitTopicId);
        return {
          topicTitle: ot.topicTitle,
          isCompleted: incoming ? incoming.isCompleted : ot.isCompleted,
          displayOrder: idx + 1,
          collegeSubjectUnitId: newUnitId,
          collegeSubjectId: ot.collegeSubjectId,
          collegeId: ot.collegeId,
          collegeSectionsId: collegeSectionId,
          createdBy: ot.createdBy,
          createdAt: now,
          updatedAt: now,
          isActive: true,
        };
      });

      if (topicsToInsert.length > 0) {
        const { data: clonedTopics, error: insertTopicsError } = await supabase
          .from("college_subject_unit_topics")
          .insert(topicsToInsert)
          .select();
          
        let finalTopics = clonedTopics;
        let requiresResourceCloning = true;

        if (insertTopicsError) {
          if (insertTopicsError.code === "23505") {
            // Topics were already cloned. Fetch them.
            const { data: existingTopics } = await supabase
              .from("college_subject_unit_topics")
              .select("*")
              .eq("collegeSubjectUnitId", newUnitId);
            
            if (existingTopics && existingTopics.length > 0) {
              finalTopics = existingTopics;
              requiresResourceCloning = false; // Resources should already be cloned
              
              // Apply progress to existing cloned topics
              for (const ot of oldTopics) {
                 const incoming = topics.find(t => t.id === ot.collegeSubjectUnitTopicId);
                 if (incoming) {
                    const matchedTopic = existingTopics.find(et => et.topicTitle === ot.topicTitle);
                    if (matchedTopic) {
                       await supabase.from("college_subject_unit_topics").update({ isCompleted: incoming.isCompleted }).eq("collegeSubjectUnitTopicId", matchedTopic.collegeSubjectUnitTopicId);
                    }
                 }
              }
            } else {
              console.error("Failed to recover cloned topics:", insertTopicsError);
              throw new Error("Unable to save progress for this section. Please try again.");
            }
          } else {
            console.error("Failed to clone topics:", insertTopicsError);
            throw new Error("Unable to save progress for this section. Please try again.");
          }
        }

        // d. Clone resources
        if (requiresResourceCloning) {
          const { data: oldResources, error: resError } = await supabase
            .from("college_subject_unit_topic_resources")
            .select("*")
            .in("collegeSubjectUnitTopicId", oldTopicIds)
            .eq("isActive", true);

          if (!resError && oldResources && oldResources.length > 0) {
            const resourcesToInsert = oldResources.reduce<any[]>((acc, res) => {
              // Find corresponding new topic by matching title & order
              const oldTopic = oldTopics.find(ot => ot.collegeSubjectUnitTopicId === res.collegeSubjectUnitTopicId);
              const newTopic = finalTopics!.find(nt => nt.topicTitle === oldTopic?.topicTitle && nt.displayOrder === oldTopic?.displayOrder);
              
              if (newTopic) {
                acc.push({
                  resourceType: res.resourceType,
                  resourceName: res.resourceName,
                  resourceUrl: res.resourceUrl,
                  collegeSubjectUnitTopicId: newTopic.collegeSubjectUnitTopicId,
                  collegeId: res.collegeId,
                  createdBy: res.createdBy,
                  isAdmin: res.isAdmin,
                  isActive: true,
                  createdAt: now,
                  updatedAt: now
                });
              }
              return acc;
            }, []);

            if (resourcesToInsert.length > 0) {
              await supabase.from("college_subject_unit_topic_resources").insert(resourcesToInsert);
            }
          }
        }
      }

      return { success: true };
    }

    // --- STANDARD PATH ---
    // 1. Update all topics
    for (const topic of topics) {
      const { error: topicError } = await supabase
        .from("college_subject_unit_topics")
        .update({
          isCompleted: topic.isCompleted,
          updatedAt: now,
        })
        .eq("collegeSubjectUnitTopicId", topic.id);

      if (topicError) {
        throw new Error(`Failed to update topic ${topic.id}: ${topicError.message}`);
      }
    }

    // 2. Update the unit percentage
    const { error: unitError } = await supabase
      .from("college_subject_units")
      .update({
        completionPercentage: percentage,
        updatedAt: now,
      })
      .eq("collegeSubjectUnitId", unitId);

    if (unitError) {
      throw new Error(`Failed to update unit percentage: ${unitError.message}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in saveUnitProgress:", error);
    return { success: false, error: error.message };
  }
}
