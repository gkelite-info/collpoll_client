export const SCHOOL_BOARDS = ["CBSE", "SSC", "ICSE", "ISC", "IB"];

export const isSchoolEducation = (type: string | null | undefined): boolean => {
  if (!type) return false;
  return SCHOOL_BOARDS.includes(type.trim().toUpperCase());
};

export const parseEducationTypes = (input: any): string[] => {
  if (!input) return [];
  let arr: any[] = [];
  if (typeof input === 'string') {
    arr = input.split(',');
  } else if (Array.isArray(input)) {
    arr = input;
  } else if (input instanceof Set) {
    arr = Array.from(input);
  } else {
    arr = [input];
  }
  return arr.map(item => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && item.collegeEducationType) {
      return item.collegeEducationType;
    }
    return String(item);
  }).map(s => s.trim().toUpperCase()).filter(Boolean);
};

export const isStrictlySchoolAssigned = (collegeEducationTypeStr: any): boolean => {
  if (!collegeEducationTypeStr) return false;
  
  const types = parseEducationTypes(collegeEducationTypeStr);
  if (types.length === 0) return false;
  
  return types.every(type => SCHOOL_BOARDS.includes(type));
};

export const isStrictlySchoolOrInterAssigned = (collegeEducationTypeStr: any): boolean => {
  if (!collegeEducationTypeStr) return false;
  
  const types = parseEducationTypes(collegeEducationTypeStr);
  if (types.length === 0) return false;
  
  return types.every(type => {
     const isSchool = SCHOOL_BOARDS.includes(type);
     const isInter = type === "INTER" || type === "INTERMEDIATE";
     return isSchool || isInter;
  });
};

export const isSchoolOrInterSubject = (educationTypeStr: string | null | undefined): boolean => {
  if (!educationTypeStr) return false;
  
  const type = educationTypeStr.trim().toUpperCase();
  const isSchool = SCHOOL_BOARDS.includes(type);
  const isInter = type === "INTER" || type === "INTERMEDIATE";
  return isSchool || isInter;
};


export const getRestrictedPlacementsToastMessage = (collegeEducationTypeStr: any): string => {
  if (!collegeEducationTypeStr) return "Placements are restricted for your profile.";
  
  const types = parseEducationTypes(collegeEducationTypeStr);
  
  const hasSchool = types.some(type => SCHOOL_BOARDS.includes(type));
  const hasInter = types.some(type => type === "INTER" || type === "INTERMEDIATE");
  
  if (hasSchool && hasInter) return "Placements are not available for School and Inter profiles.";
  if (hasSchool) return "Placements are not available for School profiles.";
  if (hasInter) return "Placements are not available for Inter profiles.";
  
  return "Placements are restricted for your profile.";
};
