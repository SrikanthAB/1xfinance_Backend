import mongoose, { Document,Schema,model } from 'mongoose';

export interface ITableConfig extends Document {
  tableKey: string;
  config: Record<string, any>; // or `any` if structure is unknown
  createdAt?: Date;
  updatedAt?: Date;
}

const TableConfigSchema = new Schema({
  tableKey: { type: String, required: true }, // e.g., 'orders', 'spv', 'asset'
  config: { type: mongoose.Schema.Types.Mixed, default: {} }, // accepts any JSON structure
}, { timestamps: true });

const TableConfig =  model('TableConfig', TableConfigSchema);
export default TableConfig;
