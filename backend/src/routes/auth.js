import { Router } from "express";

const router = Router({ mergeParams: true });

//@route POST /api/v1/register
router.get("/v1/register", (req, res) => {
  res.json("this is working");
});

export default router;
