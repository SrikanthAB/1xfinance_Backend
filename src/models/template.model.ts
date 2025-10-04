import mongoose, { Document, Schema } from 'mongoose';

export interface ITemplate extends Document {
  projectId: mongoose.Types.ObjectId; // Reference to a Project document

  templateId: string;
  templateName: string;
}

const TemplateSchema: Schema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    templateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    templateName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);
const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
export default Template;
