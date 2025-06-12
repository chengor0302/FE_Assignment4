import mongoose, { Schema, Document, Types } from 'mongoose';

export interface Author {
  name: string;
  email: string;
}

export interface Note extends Document {
  title: string;
  author: Author | null;
  content: string;
  user: Types.ObjectId;
}

const noteSchema = new Schema<Note>(
  {
    title: { type: String, required: true },
    author: {
      name: { type: String },
      email: { type: String },
    },
    content: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);




export const NoteModel = mongoose.model<Note>('Note', noteSchema);
