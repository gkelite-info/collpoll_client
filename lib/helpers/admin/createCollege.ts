import { supabase } from "@/lib/supabaseClient";

type CreateCollegePayload = {
  collegeName: string;
  collegeEmail: string;
  collegeCode: string;
  address: string;
  countryCode: string;
  phoneNumber: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
};

export async function createCollege(payload: CreateCollegePayload, file: File) {
  const fileExt = file.name.split(".").pop();
  const filePath = `college-proofs/${crypto.randomUUID()}.${fileExt}`;

  const { error: uploadError, data: uploadData } = await supabase.storage
    .from("college_proofs")
    .upload(filePath, file, {
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("college_proofs")
    .getPublicUrl(uploadData.path);

  const verificationProofUrl = publicUrlData.publicUrl;

  const now = new Date().toISOString();

  const { data: college, error: collegeError } = await supabase
    .from("colleges")
    .insert({
      collegeName: payload.collegeName,
      collegeEmail: payload.collegeEmail,
      collegeCode: payload.collegeCode.toUpperCase(),
      address: payload.address,
      countryCode: payload.countryCode,
      phoneNumber: payload.phoneNumber,
      country: payload.country,
      state: payload.state,
      city: payload.city,
      pincode: payload.pincode,
      verificationProofUrl,
      is_active: true,
      is_verified: false,

      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single();

  if (collegeError) throw collegeError;

  return college;
}
