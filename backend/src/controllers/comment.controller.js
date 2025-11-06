import * as Comment from '../models/comment.model.js';

export const addComment = async (req, res) => {
  try {
    const { product_id, content } = req.body;
    const user_id = req.user.id; // asumimos que req.user viene del middleware auth
    if (!content || !product_id) return res.status(400).json({ message: 'Campos requeridos' });

    const comment = await Comment.createComment({ user_id, product_id, content });
    res.json({ success: true, comment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getComments = async (req, res) => {
  const comments = await Comment.getCommentsByProduct(req.params.product_id);
  res.json(comments);
};
