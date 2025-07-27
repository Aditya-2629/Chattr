import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    groupPic: {
      type: String,
      default: "https://via.placeholder.com/150?text=Group",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      isPrivate: {
        type: Boolean,
        default: false,
      },
      onlyAdminsCanMessage: {
        type: Boolean,
        default: false,
      },
      onlyAdminsCanAddMembers: {
        type: Boolean,
        default: false,
      },
    },
    streamChannelId: {
      type: String,
      required: true,
      unique: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
groupSchema.index({ "members.user": 1 });
groupSchema.index({ admin: 1 });
// groupSchema.index({ streamChannelId: 1 });

export default mongoose.model("Group", groupSchema);
