interface oppertunityData {
    title: string;
    postedBy : string;
    Company: string;
    companyUrl: string;
    logoUrl: string;
    type : OppertunityType;
    location: string;
    salary: string;
    applicationLink: string;
    vacancy: string;
}

enum OppertunityType {
    Internship = "Internship",
    Job = "Job",
}