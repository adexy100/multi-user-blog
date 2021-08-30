import Category from "../schemas/CategorySchema.js";
import Tag from "../schemas/TagSchema.js";
import Blog from "../schemas/BlogSchema.js";
import slugify from "slugify";

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

  const blogs = await Blog.find({ category }).populate("categories").exec();

  res.json({
    category,
    blogs,
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

export const getTags = (req, res) => {
  Tag.find({ parent: req.params._id }).exec((err, subs) => {
    if (err) console.log(err);
    res.json(tags);
  });
};
