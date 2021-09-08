import sugify from 'slugify';
import Tag from '../schemas';
import Post from '../schemas';
import ErrorHandler from "../middlewares";

export const create = async (req, res) => {
    const { name } = req.body;
    let slug = slugify(name).toLowerCase();

    let tag = new Tag({ name, slug });

    await tag.save((err, data) => {
        if (err) {
            console.log(err);
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data); // dont do this res.json({ tag: data });
    });
};

export const list = async (req, res) => {
    await Tag.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json(data);
    });
};

export const read = async (req, res, next) => {
    const slug = req.params.slug.toLowerCase();

    await Tag.findOne({ slug }).exec((err, tag) => {
        if (err) {
            return res.status(400).json({
                error: 'Tag not found'
            });
        }
        // res.json(tag);
    const posts = await Post.find({ tags: tag })
            .populate('topics', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .select('_id title slug excerpt topics postedBy tags createdAt updatedAt')
            .exec();
    if (!posts) return next(new ErrorHandler(400, "Post not found"));
    const links = await Link.find({ tags: tag })
            .populate('topics', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .select('_id title slug topics postedBy tags createdAt updatedAt')
            .exec();
    if (!links) return next(new ErrorHandler(400, "Link not found"));

    res.json({
        posts,
        links
    })      
};

export const remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        res.json({
            message: 'Tag deleted successfully'
        });
    });
};
