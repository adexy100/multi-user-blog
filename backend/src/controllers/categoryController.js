import Category from "../schemas/CategorySchema.js";
import Topic from "../schemas/TopicSchema.js";
import Post from "../schemas/PostSchema.js";
import Link from "../schemas/LinkSchema.js";
import slugify from "slugify";
import ErrorHandler from "../middlewares";

export const create = async (req, res) => {
  try {
    const { name, content } = req.body;
    const category = await new Category({
      name,
      content,
      slug: slugify(name),
    }).save();

    if (category) {
      res.status(201).json(category);
    } else {
      res.status(400);
      throw new Error("Category already exist");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Create category failed");
  }
};

export const list = async (req, res) => {
  const categories = await Category.find({}).sort({ createdAt: -1 }).exec();
  res.json(categories);
};

export const read = async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug }).exec();

  const posts = await Post.find({ category }).populate("categories").exec();
  if (!posts) return next(new ErrorHandler(400, "Post not found"));
  const links = await Link.find({ category }).populate("categories").exec();
  if (!links) return next(new ErrorHandler(400, "Link not found"));

  res.json({
    category,
    posts,
    links
  });
};

export const update = async (req, res) => {
  const { name, content } = req.body;
  const newData = {
    name,
    desc,
    slug: slugify(name),
  };
  try {
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      newData,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).send("Category update failed");
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    res.json({ message: "Category removed" });
  } catch (err) {
    res.status(500).send("Category delete failed");
  }
};

export const getTopics = (req, res) => {
  Topic.find({ parent: req.params._id }).exec((err, topics) => {
    if (err) console.log(err);
    res.json(topics);
  });
};
