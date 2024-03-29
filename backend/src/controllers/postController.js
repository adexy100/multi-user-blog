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
import ErrorHandler from "../middlewares";
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

export const postLike = async (req, res, next) => {
  try {
      const { post_id } = req.params;

      const post = await Post.findById(post_id);

      if (!post) return next(new ErrorHandler(400, 'Post not found.'));

      let state = false; // the state whether isLiked = true | false to be sent back to user
      const query = {
          target: Types.ObjectId(post_id),
          user: req.user._id,
          type: 'Post'
      };

      const likedPost = await Like.findOne(query); // Check if already liked post

      if (!likedPost) { // If not liked, save new like and notify post owner
          const like = new Like({
              type: 'Post',
              target: post._id,
              user: req.user._id
          });

          await like.save();
          state = true;

          // If not the post owner, send notification to post owner
          if (post._author_id.toString() !== req.user._id.toString()) {
              const io = req.app.get('io');
              const targetUserID = Types.ObjectId(post._author_id);
              const newNotif = {
                  type: ENotificationType.like,
                  initiator: req.user._id,
                  target: targetUserID,
                  link: `/post/${post_id}`,
              };
              const notificationExists = await Notification.findOne(newNotif);

              if (!notificationExists) {
                  const notification = new Notification({ ...newNotif, createdAt: Date.now() });

                  const doc = await notification.save();
                  await doc
                      .populate({
                          path: 'target initiator',
                          select: 'fullname profilePicture username'
                      })
                      .execPopulate();

                  io.to(targetUserID).emit('newNotification', { notification: doc, count: 1 });
              } else {
                  await Notification.findOneAndUpdate(newNotif, { $set: { createdAt: Date.now() } });
              }
          }
      } else {
          await Like.findOneAndDelete(query);
          state = false;
      }

      const likesCount = await Like.find({ target: Types.ObjectId(post_id) });

      res.status(200).send(makeResponseJson({ state, likesCount: likesCount.length }));
  } catch (e) {
      console.log(e);
      next(e);
  }
};

export const getLikes = async (req, res, next) => {
  try {
      const { post_id } = req.params;
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = LIKES_LIMIT;
      const skip = offset * limit;

      const exist = await Post.findById(Types.ObjectId(post_id));
      if (!exist) return next(new ErrorHandler(400, 'Post not found.'));

      const likers = await Like
          .find({
              target: Types.ObjectId(post_id),
              type: 'Post'
          })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
              path: 'user',
              select: 'profilePicture username fullname'
          })

      if (likers.length === 0 && offset < 1) {
          return next(new ErrorHandler(404, 'No likes found.'));
      }

      if (likers.length === 0 && offset > 0) {
          return next(new ErrorHandler(404, 'No more likes found.'));
      }

      const myFollowingDoc = await Follow.find({ user: req.user._id });
      const myFollowing = myFollowingDoc.map(user => user.target);

      const result = likers.map((like) => {
          return {
              ...like.user.toObject(),
              isFollowing: myFollowing.includes(like.user.id)
          }
      });

      res.status(200).send(makeResponseJson(result));
  } catch (e) {
      console.log('CANT GET POST LIKERS', e);
      next(e);
  }
};

export const clickCheck = (req, res) => {
    const { linkId } = req.body;
    Post.findByIdAndUpdate(linkId, { $inc: { clicks: 1 } }, { upsert: true, new: true }).exec((err, result) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: 'Could not update view count'
            });
        }
        res.json(result);
    });
};