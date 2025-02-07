import { Profile } from "../models/profile.model.js"

const profileController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Profile ID is required" });
        }

        console.log("Received user id:", id);

        const profile = await Profile.findOne({ user: id }).populate("user", "fullname email").populate("commission")
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.status(200).json(profile);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export default profileController;
