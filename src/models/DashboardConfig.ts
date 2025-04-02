
import mongoose, { Schema, Document } from 'mongoose';

export interface IDashboardWidget {
  id: string;
  title: string;
  type: 'card' | 'chart' | 'table' | 'list';
  dataSource: string;
  position: { x: number; y: number; w: number; h: number };
  settings: Record<string, any>;
  isActive: boolean;
}

export interface IDashboardConfig extends Document {
  name: string;
  description: string;
  layout: 'grid' | 'flex';
  role: 'admin' | 'teacher' | 'student';
  widgets: IDashboardWidget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DashboardWidgetSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['card', 'chart', 'table', 'list'], 
    required: true 
  },
  dataSource: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    w: { type: Number, required: true },
    h: { type: Number, required: true }
  },
  settings: { type: Object, default: {} },
  isActive: { type: Boolean, default: true }
});

const DashboardConfigSchema = new Schema<IDashboardConfig>({
  name: { type: String, required: true },
  description: { type: String },
  layout: { 
    type: String, 
    enum: ['grid', 'flex'], 
    default: 'grid' 
  },
  role: { 
    type: String, 
    enum: ['admin', 'teacher', 'student'], 
    required: true 
  },
  widgets: [DashboardWidgetSchema],
  isDefault: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Check if the model already exists to prevent compilation errors
export default mongoose.models.DashboardConfig || mongoose.model<IDashboardConfig>('DashboardConfig', DashboardConfigSchema);
