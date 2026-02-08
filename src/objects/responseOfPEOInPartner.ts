interface Consultant {
  id: string;
  level: number;
  departmentId: string;
  subDomain?: string | null;
  // thêm các field khác nếu cần
}

export interface PartnerWithConsultants {
  id: string;
  name: string;
  level: number;
  consultants: Consultant[];
  // thêm các field khác nếu cần
}
