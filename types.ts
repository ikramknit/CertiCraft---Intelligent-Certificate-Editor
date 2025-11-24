export interface CertificateData {
  universityNameHindi: string;
  universityNameEnglish: string;
  studentName: string;
  courseName: string; // e.g., Master of Computer Application
  division: string; // e.g., First Division
  year: string; // e.g., 2008
  date: string; // e.g., Lucknow, Dated: ...
  viceChancellorName: string; // For the signature label
}

export const INITIAL_DATA: CertificateData = {
  universityNameHindi: "उत्तर प्रदेश प्राविधिक विश्वविद्यालय",
  universityNameEnglish: "Uttar Pradesh Technical University",
  studentName: "JAVED ALAM",
  courseName: "Master of Computer Application",
  division: "First Division",
  year: "2008",
  date: "Lucknow, Dated: 30/06/2008",
  viceChancellorName: "Prem Vrat",
};
