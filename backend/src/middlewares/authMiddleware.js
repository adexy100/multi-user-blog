export default authMiddleware = (req, res, next) => {
	const authUserId = req.user._id;
	User.findById({ _id: authUserId }). exec((err, user) => {
		if (err || !user) {
			return res,status(400).json({
				error: 'Access denied, Please Login'
			});
		}
		req.profile = user;
		next();
	});
};

export default requireSignin = expressJwt({ secret: process.env.JWT_SECRET }); // req.user
