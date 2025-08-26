export class Consultation {
  uuid: string;
  userId: number;
  user?: {
    uuid: string;
  };
  lineName: string;
  name: string;
  phone: string;
  address: string;
  childName: string;
  yearSelected: string;
  weight: string;
  primaryMedical: string;
  topicSelected: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
