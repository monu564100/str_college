/**
 * Utility functions for consistently identifying students by USN
 */

/**
 * Get storage key for student marks based on USN
 * This allows us to consistently access student data
 */
export const getStudentMarksStorageKey = (usn: string): string => {
  return `student_marks_${usn}`;
};

/**
 * Get storage key for student projects based on USN
 * This allows us to consistently access student project data
 */
export const getStudentProjectStorageKey = (usn: string): string => {
  return `student_projects_${usn}`;
};

/**
 * Normalize USN format for consistent storage and retrieval
 */
export const normalizeUSN = (usn: string): string => {
  return usn.toUpperCase().trim();
};

/**
 * Check if a string is a valid USN format (basic validation)
 */
export const isValidUSN = (usn: string): boolean => {
  // Basic validation - adjust based on your specific USN format
  return /^[0-9A-Z]{1,12}$/i.test(usn);
};
