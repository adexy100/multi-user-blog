import Tag from "../schemas/TagSchema.js";
import Post from "../schemas/PostSchema.js";
import slugify from "slugify";

export const create = async (req, res) => {
  try {
    const { name, desc, parent } = req.body;
    const sub = await new Sub({
      name,
      desc,
      parent,
      slug: slugify(name),
    }).save();
    if (sub) {
      res.status(201).json(sub);
    } else {
      res.status(400);
      throw new Error("Tag already exist");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Create Tag failed");
  }
};

export const list = async (req, res) => {
  const subs = await Sub.find({}).sort({ createdAt: -1 }).exec();
  res.json(subs);
};

export const read = async (req, res) => {
  let tags = await tags.findOne({ slug: req.params.slug }).exec();
  const posts = await Post.find({ tags: tags })
    .populate("tags")
    .exec();

  res.json({
    tags,
    posts,
  });
};

export const update = async (req, res) => {
  const { name, desc, parent } = req.body;
  const newData = {
    name,
    desc,
    parent,
    slug: slugify(name),
  };
  try {
    const updated = await Tag.findOneAndUpdate(
      { slug: req.params.slug },
      newData,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).send("Tag update failed");
  }
};

export const remove = async (req, res) => {
  try {
    const deleted = await Tag.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (err) {
    res.status(400).send("Tag delete failed");
  }
};
