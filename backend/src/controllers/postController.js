import slugify from "slugify";
import stripHtml from "string-strip-html";
import _ from "lodash";
import fs from "fs";
const uuidv4 = require("uuid/v4");
const AWS = require("aws-sdk");
import Post from "../schemas/PostSchema.js";
import Category from "../schemas/CategorySchema.js";
import Tag from "../schemas/TagSchema.js";
import User from "../schemas/UserSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { smartTrim } from "../helpers/blog";
import config from "../config/config.js";
import { Types } from "mongoose";
import { makeResponseJson } from "../helpers/utils";

// s3
AWS.config.update(config.aws);
const s3 = new AWS.S3();

export const create = async (req, res, next) => {
  try {
    const { title, body, photo, privacy, categories, tags, channel } = req.body;
    // image data
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = image.split(";")[0].split("/")[1];

    let post = new Post({
      title: title,
      body: body,
      excerpt: smartTrim(body, 320, " ", " ..."),
      slug: slugify(title).toLowerCase(),
      mtitle: `${title} | ${process.env.APP_NAME}`,
      mdesc: stripHtml(body.substring(0, 160)),
      categories: categories,
      tags: tags,
      channel: channel,
      postedBy: req.user._id,
    });

    const params = {
      Bucket: "multi-user-blog",
      Key: `post/${uuidv4()}.${type}`,
      Body: base64Data,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    await s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.status(400).json({ error: "Upload to s3 failed" });
      }
      console.log("AWS UPLOAD RES DATA", data);
      blog.photo.url = data.Location;
      blog.photo.key = data.Key;
    });

    await post.save();
    await post
      .populate({
        path: "postedBy",
        select: "profilePicture username fullname",
      })
      .execPopulate();

    const myFollowersDoc = await Follow.find({ user_target: req.user._id }); // target is yourself
    const myFollowers = myFollowersDoc.map((user) => user.user); // so user property must be used

    const newsFeeds = myFollowers
      .map((follower) => ({
        // add post to follower's newsfeed
        follower: Types.ObjectId(follower._id),
        blog: Types.ObjectId(blog._id),
        blog_owner: req.user._id,
        createdAt: blog.createdAt,
      }))
      .concat({
        // append own post on newsfeed
        follower: req.user._id,
        blog_owner: req.user._id,
        blog: Types.ObjectId(blog._id),
        createdAt: blog.createdAt,
      });

    if (newsFeeds.length !== 0) {
      await NewsFeed.insertMany(newsFeeds);
    }

    // Notify followers that new post has been made
    if (post.privacy !== "draft") {
      const io = req.app.get("io");
      myFollowers.forEach((id) => {
        io.to(id.toString()).emit("newFeed", {
          ...blog.toObject(),
          isOwnBlog: false,
        });
      });
    }
    return res
      .status(200)
      .send(makeResponseJson({ ...blog.toObject(), isOwnBlog: true }));
  } catch (e) {
    console.log(e);
    next(e);
  }
};

// list, listAllBlogsCategoriesTags, read, remove, update

export const lists = async (req, res) => {
  let limit = req.body.limit ? parseInt(req.body.limit) : 10;
  let skip = req.body.skip ? parseInt(req.body.skip) : 0;

  await Post.find({})
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username profile")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "_id title slug excerpt categories tags postedBy createdAt updatedAt"
    )
    .exec((err, data) => {
      if (err) return next(new ErrorHandler(404, "Post not found"));
      res.status(200).send(makeResponseJson(data));
    });
};

export const read = async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  await Post.findOne({ slug })
    // .select("-photo")
    .populate("categories", "_id name slug")
    .populate("tags", "_id name slug")
    .populate("postedBy", "_id name username")
    .select(
      "_id title body slug mtitle mdesc categories tags postedBy createdAt updatedAt"
    )
    .exec((err, data) => {
      if (err) return next(new ErrorHandler(400, "Post not found"));
      res.status(200).send(makeResponseJson(data));
    });
};

export const remove = async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  await Post.findOneAndRemove({ slug }).exec((err, data) => {
    if (err) return next(new ErrorHandler(404, "Cannot remove"));
    res.json({
      message: "Post deleted successfully",
    });
  });
};

export const update = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();
    const { body, photo, privacy, tags, categoies } = req.body;
    const obj = {
      body,
      privacy,
      tags,
      categoies,
      updatedAt: Date.now(),
      isEdited: true,
    };
    // image data
    const base64Data = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = image.split(";")[0].split("/")[1];

    const oldPost = await Post.findOne({ slug }).exec();
    if (!oldPost) return next(new ErrorHandler(400, "Cannot find Blog"));

    let slugBeforeMerge = oldPost.slug;
    oldPost = _.merge(oldPost, obj);
    oldPost.slug = slugBeforeMerge;

    if (body) {
      oldPost.excerpt = smartTrim(body, 320, " ", " ...");
      oldPost.mdesc = stripHtml(body.substring(0, 160));
    }

    if (photo) {
      const deleteParams = {
        Bucket: "multi-user-blog",
        Key: `blog/${oldPost.photo.key}`,
      };

      await s3.deleteObject(deleteParams, function (err, data) {
        if (err) console.log("S3 DELETE ERROR DURING UPDATE", err);
        if (data) console.log("S3 DELETED DURING UPDATE", data);
      });

      const params = {
        Bucket: "multi-user-blog",
        Key: `post/${uuidv4()}.${type}`,
        Body: base64Data,
        ACL: "public-read",
        ContentEncoding: "base64",
        ContentType: `image/${type}`,
      };

      const result = await s3.upload(params);
      if (!result) return next(new ErrorHandler(400, "Upload to s3 failed"));

      obj.photo = {
        url: result.location,
        key: result.key,
      };
    }

    if (req.user._id.toString() === post.postedBy.toString()) {
      const updatedPost = await Post.findOneAndUpdate(
        { slug },
        { $set: obj },
        {
          new: true,
        }
      );

      await updatedPost
        .populate({
          path: "postedBy",
          select: "profilePicture username fullname",
        })
        .execPopulate();
      res
        .status(200)
        .send(makeResponseJson({ ...updatedPost.toObject(), isOwnPost: true }));
    } else {
      return next(new ErrorHandler(401));
    }
  } catch (e) {
    console.log(e, "CANT EDIT Post");
    next(e);
  }
};