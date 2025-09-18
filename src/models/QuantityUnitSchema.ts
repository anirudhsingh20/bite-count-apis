import mongoose, { Document, Schema } from 'mongoose';

export interface IQuantityUnit extends Document {
  name: string;
  shortName: string;
  defaultValue: number;
  incrementValue: number;
  createdAt: Date;
  updatedAt: Date;
}

const quantityUnitSchema = new Schema<IQuantityUnit>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    shortName: {
      type: String,
      required: [true, 'Short name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    defaultValue: {
      type: Number,
      required: [true, 'Default value is required'],
      min: [0, 'Default value must be positive'],
    },
    incrementValue: {
      type: Number,
      required: [true, 'Increment value is required'],
      min: [0.1, 'Increment value must be at least 0.1'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
quantityUnitSchema.index({ name: 1 });
quantityUnitSchema.index({ shortName: 1 });

// Static method to search units
quantityUnitSchema.statics.searchUnits = function (query: any) {
  return this.find(query).sort({ name: 1 });
};

const QuantityUnit = mongoose.model<IQuantityUnit>(
  'QuantityUnit',
  quantityUnitSchema
);

export default QuantityUnit;
