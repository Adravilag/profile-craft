// src/models/ArticleView.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface IArticleView extends Document {
  _id: string;
  project_id: string;
  ip_address: string;
  user_agent?: string;
  viewed_at: Date;
}

const ArticleViewSchema: Schema = new Schema({
  project_id: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  ip_address: {
    type: String,
    required: true,
    index: true
  },
  user_agent: {
    type: String,
    default: null
  },
  viewed_at: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Índices compuestos para evitar múltiples vistas de la misma IP en poco tiempo
ArticleViewSchema.index({ project_id: 1, ip_address: 1 });
ArticleViewSchema.index({ project_id: 1, viewed_at: -1 });

// TTL index para eliminar vistas muy antiguas (opcional - después de 1 año)
ArticleViewSchema.index({ viewed_at: 1 }, { expireAfterSeconds: 31536000 });

const ArticleView = mongoose.model<IArticleView>('ArticleView', ArticleViewSchema);
export default ArticleView;
