import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation extends Document {
  title: string;
  institution: string;
  start_date: string;
  end_date?: string;
  description?: string;
  grade?: string;
  user_id: string | mongoose.Types.ObjectId;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

const educationSchema = new Schema<IEducation>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  institution: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  start_date: {
    type: String,
    required: true
  },
  end_date: {
    type: String,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  grade: {
    type: String,
    trim: true,
    maxlength: 100
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_index: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Índices para optimizar consultas
educationSchema.index({ user_id: 1, order_index: 1 });
educationSchema.index({ user_id: 1, start_date: -1 });

const Education = mongoose.model<IEducation>('Education', educationSchema);

export default Education;
