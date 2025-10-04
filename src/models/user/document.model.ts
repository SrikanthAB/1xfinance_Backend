import mongoose, { Schema, Document } from "mongoose";

export interface IDocument extends Document {
  Actions: {
    Document_Check: string;
    Human_Review_Compare: string;
    Human_Review_Document_Check: string;
    Human_Review_Liveness_Check: string;
    Liveness_Check: string;
    Register_Selfie: string;
    Return_Personal_Info: string;
    Selfie_To_ID_Card_Compare: string;
    Verify_Document: string;
  };
  Country: string;
  DOB: string;
  Document: string;
  ExpirationDate: string;
  FullName: string;
  Gender: string;
  IDNumber: string;
  IDType: string;
  IssuanceDate: string;
  ImageLinks: {
    id_card_back: string;
    id_card_image: string;
    selfie_image: string;
  };
  DocumentReceipt: string;
  PartnerParams: {
    job_id: string;
    user_id: string;
    job_type: number;
  };
  PhoneNumber2?: string;
  ResultCode: string;
  ResultText: string;
  SecondaryIDNumber?: string;
  SmileJobID: string;
  signature: string;
  timestamp: string;
   Result?: {
    JobComplete?: boolean;
    Success?: boolean;
    Code?: string;
    Message?: string;
    [key: string]: any;
  };
}

const DocumentSchema: Schema = new Schema({
  Actions: {
    Document_Check: { type: String },
    Human_Review_Compare: { type: String },
    Human_Review_Document_Check: { type: String },
    Human_Review_Liveness_Check: { type: String },
    Liveness_Check: { type: String },
    Register_Selfie: { type: String },
    Return_Personal_Info: { type: String },
    Selfie_To_ID_Card_Compare: { type: String },
    Verify_Document: { type: String },
  },
  Country: { type: String },
  DOB: { type: String },
  Document: { type: String },
  ExpirationDate: { type: String },
  FullName: { type: String },
  Gender: { type: String },
  IDNumber: { type: String },
  IDType: { type: String },
  IssuanceDate: { type: String },
  ImageLinks: {
    id_card_back: { type: String },
    id_card_image: { type: String },
    selfie_image: { type: String },
  },
  DocumentReceipt: { type: String },
  PartnerParams: {
    job_id: { type: String },
    user_id: { type: String },
    job_type: { type: Number },
  },
  PhoneNumber2: { type: String },
  ResultCode: { type: String },
  ResultText: { type: String },
  SecondaryIDNumber: { type: String },
  SmileJobID: { type: String },
  signature: { type: String },
  timestamp: { type: String },
  
});

export const DocumentModel = mongoose.model<IDocument>("Document", DocumentSchema);
export default DocumentModel


export interface SmileJobStatusResponse extends IDocument{
  code: string;
  job_complete: boolean;
  job_success: boolean;
  signature: string;
  timestamp: string;
  result: {
    Actions: {
      Document_Check: string;
      Liveness_Check: string;
      Register_Selfie: string;
      Verify_Document: string;
      Human_Review_Compare: string;
      Return_Personal_Info: string;
      Selfie_To_ID_Card_Compare: string;
      Human_Review_Document_Check: string;
      Human_Review_Liveness_Check: string;
    };
    ResultCode: string;
    ResultText: string;
    ResultType: string;
    SmileJobID: string;
    IsFinalResult: string;
    PartnerParams: {
      job_id: string;
      user_id: string;
      job_type: number;
    };
  };
}
