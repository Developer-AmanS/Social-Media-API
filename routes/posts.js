const router = require("express").Router();
const Post = require("../models/Post");
const User = require('../models/User');


//Create

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (e) {
    res.status(500).json(e);
  }
});

//Update

router.put("/:id",async (req,res) => {

    try{
    const post = await Post.findById(req.params.id);
    if(post.userId ===  req.body.userId){
        await post.updateOne({$set: req.body});
        res.status(200).json("Post have been updated")
    }
    else{
        res.status(403).json("You can update your posts only")
    }

    } catch(e){
        res.status(500).json(e);
    }
})

//delete



router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("Post have been deleted");
    } else {
      res.status(403).json("You can delete your posts only");
    }
  } catch (e) {
    res.status(500).json(e);
  }
});

//like


router.put("/:id/like", async(req,res) =>{
    try{
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes:req.body.userId} });
            res.status(200).json("The post has been liked");
        } else{
            await post.updateOne({$pull:{likes:req.body.userId}});
            res.status(200).json("The post has been diliked");

        }
    }catch(e){
        res.status(500).json(e)
    }
});


//get


router.get("/:id",async(req,res) => {
    try{
            const post = Post.findById(req.params.id);
            res.status(200).json(post)
    }catch(e){
        res.status(500).json(e);
    }
})



//get timeline

router.get("/timeline/all",async (req, res) => {

    try{
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({userId: currentUser._id});

        const friendPosts = await Promise.all(
            currentUser.following.map(friendId => {
                return Post.find({userId:friendId});
            })
        );

        res.json(userPosts.concat(...friendPosts))
    }catch(e){
        res.status(500).json(e)
    }
});

module.exports = router;
