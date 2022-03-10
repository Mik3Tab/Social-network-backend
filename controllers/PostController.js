const Post = require("../models/Post");
const User = require("../models/User");
const PostController = {
  async find(req, res) {
    const posts = await Post.find().populate("userId")
    res.send(posts.reverse());
  },
  async create(req, res) {
    try {
      const post = await Post.create({
        ...req.body,
        userId: req.user._id,
        userName: req.user.name,
      })
      await User.findByIdAndUpdate(req.user._id, {
        $push: { postId: post._id },
      });
      res.send(post);
    } catch (error) {
      console.log(error);
    }
  },
  async findByTitle(req, res) {
    const title = new RegExp(`${req.params.title}`, 'i')
    const post = await Post.aggregate([
      {
        $match: {
          title
        },
      },
    ]);
    res.send(post);
  },
  async update(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(req.params._id, req.body, {
        new: true,
      });
      post.img = req.file.originalname;
      res.status(201).send(post);
    } catch (error) {
      console.log(error);
    }
  },
  async findById(req, res) {
    try {
      const post = await Post.findById(req.params._id);
      if (!post) return res.send("post dosent exist");
      res.send(post);
    } catch (error) {
      console.log(error);
    }
  },
  async delete(req, res) {
    try {
      const post = await Post.findByIdAndDelete(req.params._id);
      console.log('post',post)
      res.send({message:"Post has been deleted",_id:req.params._id});
    } catch (error) {
      console.log(error);
    }
  },
  async like(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params._id,
        { $push: { likes: req.user._id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { likes: req.params._id } },
        { new: true }
      );
      res.send(post);
    } catch (error) {
      console.log(error);
    }
  },
  async dislike(req, res) {
    try {
      const post = await Post.findByIdAndUpdate(
        req.params._id,
        { $pull: { likes: req.user._id } },
        { new: true }
      );
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { likes: req.params._id } },
        { new: true }
      );
      res.send(post);
    } catch (error) {
      console.log(error);
    }
  },
  async insertcomment(req, res) {
    try {
      const post = await Post.findOneAndUpdate(
        req.params._id,
        {
          $push: {
            comments: {
              ...req.body,
              userId: req.user._id,
            },
          },
        },
        { new: true }
      );
      res.send(post);
    } catch (error) {
      console.log(error);
    }
  },
};

module.exports = PostController;