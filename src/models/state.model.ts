import mongoose, { Document, Schema, SchemaDefinitionProperty } from 'mongoose';
import { IState } from '../interfaces/global';

// Create the State schema
const StateSchema: Schema = new Schema<IState>({
  name: {
    type: String,
    required: [true, 'Please enter the state name'],
    trim: true,
    unique: true,
  },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: true,
  } as SchemaDefinitionProperty,
  cities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
    } as SchemaDefinitionProperty
  ]
}, {
  timestamps: true
});

// Create and export the State model
export default mongoose.model<IState>('State', StateSchema);
