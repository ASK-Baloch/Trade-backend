import { Video } from "../models/video.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { apierror } from "../utils/apierror.js";
import { apiresponse } from "../utils/responsehandler.js";
import { User } from "../models/user.model.js";

export const addcategory = asynchandler(async (req, res) => {
  const { category } = req.body;

  if (!category) {
    return new apierror(400, "All fields are required");
  } else {
    try {
      const createdcategory = await Video.create({ category });

      if (createdcategory) {
        return res.status(200).json({ category: createdcategory });
      }
    } catch (error) {
      console.log(error);
    }
  }
});

export const updatecategory = asynchandler(async (req, res) => {
  const { id, category } = req.body;

  if (!id) {
    return new apierror(400, "Id is missing");
  }

  try {
    const video = await Video.findByIdAndUpdate(
      id,
      { category: category },
      { new: true }
    );
    if (video) {
      return res
        .status(200)
        .json(new apiresponse(200, video, "Category updated Successfully"));
    }
  } catch (error) {
    console.log(error);
  }
});

export const deletecategory = asynchandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return new apierror(400, "Id is missing");
  }

  try {
    const video = await Video.findByIdAndDelete(id, { new: true });
    if (video) {
      return res
        .status(200)
        .json(new apiresponse(200, video, "Category deleted Successfully"));
    }
  } catch (error) {}
});

export const getallcategories = asynchandler(async (req, res) => {
  // Since there's no backend authentication, we require a userId to be passed in the query string.
  const { userId } = req.query;
  if (!userId) {
    return res
      .status(400)
      .json({ message: "User ID is required to access categories." });
  }

  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Check if the user is approved
  if (!user.approved) {
    return res
      .status(403)
      .json({ message: "User not approved for video access." });
  }

  // If approved, retrieve and return video categories
  const categories = await Video.find();
  return res.status(200).json({
    message: "All Categories",
    categories,
  });
});

export const addvideo = asynchandler(async (req, res) => {
  const { id, title, heading, description, url } = req.body;

  if (!id || !title || !heading || !description || !url) {
    return res.status(400).json(new apierror(400, "All fields are required"));
  }

  try {
    const video = await Video.findById(id);
    if (video) {
      video.category_videos.push({
        title,
        heading,
        description,
        url,
      });

      const createdvideo = await video.save();

      if (createdvideo) {
        return res
          .status(200)
          .json(new apiresponse(200, createdvideo, "Video added successfully"));
      }
    } else {
      return res.status(404).json(new apierror(404, "Video not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apierror(500, "Internal server error"));
  }
});

export const updatevideo = asynchandler(async (req, res) => {
  const { id, title, heading, description, url, videoid } = req.body;

  if (!id || !videoid) {
    return res.status(400).json(new apierror(400, "Ids are missing"));
  }

  try {
    const video = await Video.findById(id);
    if (video) {
      const findedvideo = video.category_videos.find((i) => i.id === videoid);
      if (findedvideo) {
        if (title) findedvideo.title = title;
        if (heading) findedvideo.heading = heading;
        if (description) findedvideo.description = description;
        if (url) findedvideo.url = url;

        const updatedvideo = await video.save();
        if (updatedvideo) {
          return res
            .status(200)
            .json(
              new apiresponse(200, updatedvideo, "Video updated successfully")
            );
        }
      } else {
        return res
          .status(404)
          .json(new apierror(404, "Video not found in category"));
      }
    } else {
      return res.status(404).json(new apierror(404, "Category not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apierror(500, "Internal server error"));
  }
});

export const deletevideo = asynchandler(async (req, res) => {
  const { id, videoid } = req.body;

  if (!id || !videoid) {
    return res.status(400).json(new apierror(400, "Ids are missing"));
  }

  try {
    const video = await Video.findById(id);
    if (video) {
      const videoIndex = video.category_videos.findIndex(
        (i) => i.id === videoid
      );
      if (videoIndex !== -1) {
        video.category_videos.splice(videoIndex, 1); // Removes the video from the array
        const updatedvideo = await video.save();
        return res
          .status(200)
          .json(
            new apiresponse(200, updatedvideo, "Video deleted successfully")
          );
      } else {
        return res
          .status(404)
          .json(new apierror(404, "Video not found in category"));
      }
    } else {
      return res.status(404).json(new apierror(404, "Category not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apierror(500, "Internal server error"));
  }
});


export const getvideosbycategoryid = asynchandler(async (req, res) => {
  const { Id } = req.params;
  const { userId } = req.query;  // Expect userId to be passed as a query parameter

  if (!Id) {
    return res.status(400).json(new apierror(400, "Category ID is missing"));
  }
  
  if (!userId) {
    return res.status(400).json(new apierror(400, "User ID is required"));
  }

  // Verify that the user exists and is approved
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new apierror(404, "User not found"));
  }
  if (!user.approved) {
    return res.status(403).json(new apierror(403, "User not approved for video access"));
  }

  try {
    const category = await Video.findById(Id);
    if (category) {
      return res
        .status(200)
        .json(new apiresponse(200, category.category_videos, "Videos fetched successfully"));
    } else {
      return res.status(404).json(new apierror(404, "Category not found"));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json(new apierror(500, "Internal server error"));
  }
});


export const getvideobyid = asynchandler(async (req, res) => {
  const { id, videoid, userId } = req.body;

  if (!id || !videoid || !userId) {
    return res.status(400).json(new apierror(400, "Category ID, video ID, and User ID are required"));
  }

  // Verify that the user exists and is approved
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json(new apierror(404, "User not found"));
  }
  if (!user.approved) {
    return res.status(403).json(new apierror(403, "User not approved for video access"));
  }

  try {
    const category = await Video.findById(id);
    if (category) {
      const video = category.category_videos.find((i) => i.id === videoid);
      if (video) {
        return res.status(200).json(new apiresponse(200, video, "Video found"));
      } else {
        return res.status(404).json(new apierror(404, "Video not found in category"));
      }
    } else {
      return res.status(404).json(new apierror(404, "Category not found"));
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json(new apierror(500, "Internal server error"));
  }
});