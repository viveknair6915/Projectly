import mongoose, { Document, Schema } from 'mongoose';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ProjectMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface IProjectMember {
  user: mongoose.Types.ObjectId;
  role: ProjectMemberRole;
  joinedAt: Date;
}

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  key: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: Date;
  deadline?: Date;
  owner: mongoose.Types.ObjectId;
  members: IProjectMember[];
  archived: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectMemberSchema = new Schema<IProjectMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['OWNER', 'ADMIN', 'MEMBER'],
      default: 'MEMBER',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    key: {
      type: String,
      required: [true, 'Project key is required'],
      uppercase: true,
      trim: true,
      maxlength: [10, 'Project key cannot exceed 10 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'],
      default: 'ACTIVE',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    startDate: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [ProjectMemberSchema],
    archived: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ name: 'text', description: 'text', key: 'text' });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ 'members.user': 1 });
ProjectSchema.index({ status: 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
