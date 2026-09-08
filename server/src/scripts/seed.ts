import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { Activity } from '../models/Activity';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Purging existing database collections...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await Activity.deleteMany({});

    console.log('[Seed] Creating demo users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex@projectly.dev',
        passwordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'ADMIN',
        title: 'Principal Product Architect',
        department: 'Core Product',
      },
      {
        name: 'Sarah Chen',
        email: 'sarah@projectly.dev',
        passwordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        role: 'MEMBER',
        title: 'Senior Frontend Engineer',
        department: 'Frontend Engineering',
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@projectly.dev',
        passwordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        role: 'MEMBER',
        title: 'Backend Systems Tech Lead',
        department: 'Infrastructure',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@projectly.dev',
        passwordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        role: 'MEMBER',
        title: 'Lead UI/UX Designer',
        department: 'Design System',
      },
    ]);

    const [alex, sarah, marcus, elena] = users;

    console.log('[Seed] Creating demo projects...');
    const now = new Date();
    const inTwoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const inOneMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const pastOneWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const project1 = await Project.create({
      name: 'Projectly Core Cloud Platform',
      key: 'PRJ',
      description: 'Architecting the next-generation microservices backbone, real-time collaboration engine, and interactive dashboard ecosystem.',
      status: 'ACTIVE',
      priority: 'URGENT',
      startDate: pastOneWeek,
      deadline: inOneMonth,
      tags: ['Platform', 'Cloud', 'Microservices', 'Q3-Sprint'],
      owner: alex._id,
      members: [
        { user: alex._id, role: 'OWNER', joinedAt: pastOneWeek },
        { user: sarah._id, role: 'ADMIN', joinedAt: pastOneWeek },
        { user: marcus._id, role: 'MEMBER', joinedAt: pastOneWeek },
        { user: elena._id, role: 'MEMBER', joinedAt: pastOneWeek },
      ],
    });

    const project2 = await Project.create({
      name: 'Design System & Mobile Apps',
      key: 'MBL',
      description: 'Unified cross-platform design token library, dark-mode native components, and responsive mobile workspace.',
      status: 'ACTIVE',
      priority: 'HIGH',
      startDate: pastOneWeek,
      deadline: inTwoWeeks,
      tags: ['Design', 'Mobile', 'UI-Tokens'],
      owner: elena._id,
      members: [
        { user: elena._id, role: 'OWNER', joinedAt: pastOneWeek },
        { user: alex._id, role: 'ADMIN', joinedAt: pastOneWeek },
        { user: sarah._id, role: 'MEMBER', joinedAt: pastOneWeek },
      ],
    });

    const project3 = await Project.create({
      name: 'Global Multi-Region Resiliency',
      key: 'INFRA',
      description: 'Zero-downtime active-active database replication, low-latency CDN routing, and disaster recovery automations.',
      status: 'PLANNING',
      priority: 'MEDIUM',
      startDate: now,
      deadline: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      tags: ['DevOps', 'AWS', 'Multi-Region'],
      owner: marcus._id,
      members: [
        { user: marcus._id, role: 'OWNER', joinedAt: now },
        { user: alex._id, role: 'MEMBER', joinedAt: now },
      ],
    });

    const project4 = await Project.create({
      name: 'Automated CI/CD Quality Gates',
      key: 'PIPE',
      description: 'Automated end-to-end regression suites, branch previews, security scanning, and seamless production canary deployments.',
      status: 'COMPLETED',
      priority: 'HIGH',
      startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      deadline: pastOneWeek,
      tags: ['DevOps', 'CI/CD', 'Security'],
      owner: alex._id,
      members: [
        { user: alex._id, role: 'OWNER', joinedAt: now },
        { user: marcus._id, role: 'MEMBER', joinedAt: now },
      ],
    });

    console.log('[Seed] Creating demo tasks for Projectly Core Cloud Platform...');
    const tasksProject1 = [
      {
        title: 'Implement JWT session invalidation and role middleware',
        description: 'Provide secure bearer token validation, route-level role checking (OWNER, ADMIN, MEMBER), and graceful token expiry handling.',
        project: project1._id,
        status: 'DONE',
        priority: 'HIGH',
        assignee: marcus._id,
        reporter: alex._id,
        dueDate: pastOneWeek,
        labels: ['backend', 'security', 'auth'],
        order: 0,
        completedAt: new Date(pastOneWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Design interactive Kanban board with fluid drag-and-drop',
        description: 'Build responsive columns for TODO, IN PROGRESS, REVIEW, and DONE with real-time drag-and-drop and status persistence to MongoDB.',
        project: project1._id,
        status: 'DONE',
        priority: 'URGENT',
        assignee: sarah._id,
        reporter: alex._id,
        dueDate: now,
        labels: ['frontend', 'kanban', 'ui/ux'],
        order: 1,
        completedAt: now,
      },
      {
        title: 'Build realtime analytics and dashboard distribution charts',
        description: 'Aggregate project progress, overdue task counters, status breakdowns, and team activity feeds for executive overview.',
        project: project1._id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: sarah._id,
        reporter: alex._id,
        dueDate: inTwoWeeks,
        labels: ['frontend', 'dashboard', 'analytics'],
        order: 0,
      },
      {
        title: 'Optimize MongoDB text search indexes on tasks and projects',
        description: 'Implement compound indexes on title, description, and status for sub-50ms query latency under heavy concurrency.',
        project: project1._id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignee: marcus._id,
        reporter: alex._id,
        dueDate: inTwoWeeks,
        labels: ['database', 'performance'],
        order: 1,
      },
      {
        title: 'Team member role delegation & invitation modal',
        description: 'Allow project owners and admins to invite users by email or selection, toggle between ADMIN and MEMBER roles, or remove members.',
        project: project1._id,
        status: 'REVIEW',
        priority: 'HIGH',
        assignee: sarah._id,
        reporter: alex._id,
        dueDate: inTwoWeeks,
        labels: ['frontend', 'collaboration'],
        order: 0,
      },
      {
        title: 'Audit logging and activity stream timeline',
        description: 'Track every state transition, task assignment, comment, and member addition with user avatar and formatted timestamp.',
        project: project1._id,
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: alex._id,
        reporter: alex._id,
        dueDate: inOneMonth,
        labels: ['backend', 'audit'],
        order: 0,
      },
      {
        title: 'Configure automated Docker compose & production readiness checklist',
        description: 'Verify production builds, environment variables isolation, and CORS policy verification.',
        project: project1._id,
        status: 'TODO',
        priority: 'LOW',
        assignee: marcus._id,
        reporter: alex._id,
        dueDate: inOneMonth,
        labels: ['devops'],
        order: 1,
      },
    ];

    const createdTasks = await Task.create(tasksProject1);

    await Task.create([
      {
        title: 'Export Figma design tokens to Tailwind theme config',
        description: 'Export brand colors, elevations, radii, and typography to tailwind.config.js.',
        project: project2._id,
        status: 'DONE',
        priority: 'HIGH',
        assignee: elena._id,
        reporter: elena._id,
        dueDate: pastOneWeek,
        labels: ['design', 'tailwind'],
        order: 0,
        completedAt: now,
      },
      {
        title: 'Build responsive navigation drawer for mobile viewports',
        description: 'Ensure smooth collapsible navigation on tablet and mobile phones.',
        project: project2._id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: sarah._id,
        reporter: elena._id,
        dueDate: inTwoWeeks,
        labels: ['frontend', 'mobile'],
        order: 0,
      },
      {
        title: 'Benchmark multi-region read replica latency',
        description: 'Measure replication lag between us-east-1 and eu-central-1 under peak write conditions.',
        project: project3._id,
        status: 'TODO',
        priority: 'MEDIUM',
        assignee: marcus._id,
        reporter: marcus._id,
        dueDate: inOneMonth,
        labels: ['infrastructure', 'benchmark'],
        order: 0,
      },
      {
        title: 'Setup GitHub Actions matrix build for client & server',
        description: 'Automated type checking, linting, and bundle size budgeting.',
        project: project4._id,
        status: 'DONE',
        priority: 'HIGH',
        assignee: alex._id,
        reporter: alex._id,
        dueDate: pastOneWeek,
        labels: ['ci/cd', 'github-actions'],
        order: 0,
        completedAt: pastOneWeek,
      },
    ]);

    console.log('[Seed] Creating demo comments...');
    await Comment.create([
      {
        task: createdTasks[1]._id,
        author: alex._id,
        content: 'Sarah, the drag-and-drop interaction looks buttery smooth! Optimistic UI response makes moving cards feel instantaneous.',
      },
      {
        task: createdTasks[1]._id,
        author: sarah._id,
        content: 'Thanks Alex! I also added visual drop indicators and ensured fallback status updates if the network momentarily disconnects.',
      },
      {
        task: createdTasks[2]._id,
        author: elena._id,
        content: 'The gradient accent colors on the KPI metric cards contrast wonderfully with the dark slate background.',
      },
    ]);

    console.log('[Seed] Creating demo activity log...');
    await Activity.create([
      {
        project: project1._id,
        task: createdTasks[1]._id,
        user: sarah._id,
        action: 'TASK_STATUS_CHANGED',
        message: 'Sarah Chen moved "Design interactive Kanban board" to DONE',
        createdAt: now,
      },
      {
        project: project1._id,
        task: createdTasks[2]._id,
        user: sarah._id,
        action: 'TASK_UPDATED',
        message: 'Sarah Chen updated task "Build realtime analytics and dashboard distribution charts"',
        createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        project: project1._id,
        user: alex._id,
        action: 'MEMBER_ADDED',
        message: 'Alex Rivera added Elena Rostova to project Projectly Core Cloud Platform',
        createdAt: pastOneWeek,
      },
      {
        project: project1._id,
        user: alex._id,
        action: 'PROJECT_CREATED',
        message: 'Alex Rivera created project "Projectly Core Cloud Platform" (PRJ)',
        createdAt: pastOneWeek,
      },
    ]);

    console.log(`
  =============================================================
   Projectly Seed Successful!
  -------------------------------------------------------------
  Demo Accounts (Password for all: "password123"):
    • alex@projectly.dev   (Alex Rivera - Principal Architect & Admin)
    • sarah@projectly.dev  (Sarah Chen - Senior Frontend Engineer)
    • marcus@projectly.dev (Marcus Vance - Backend Systems Tech Lead)
    • elena@projectly.dev  (Elena Rostova - Lead UI/UX Designer)
  =============================================================
    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
