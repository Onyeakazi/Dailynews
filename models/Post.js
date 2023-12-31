const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const URLSlugs = require("mongoose-url-slugs");

const PostSchema = new Schema({
    
    user: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    
    category: {
        type: Schema.Types.ObjectId,
        ref: "categories"
    },
    
    news: {
        type: String
    },

    comment: {
        type: Schema.Types.ObjectId,
        ref: "comments"
    },
    
    replies: {
        type: Schema.Types.ObjectId,
        ref: "replies"
    },

    title: {
        type: String,
        required: true
    }, 


    status: {
        type: String,
        default: "draft"
    }, 

    allowComments: {
        type: Boolean,
        default: true,
        required: true
    }, 

    body: {
        type: String,
        required: true
    },

    file: {
        type: String,
        default: 'placeholder.png',
        required: true
    },

    date: {
        type: Date,
        default: Date.now()
    },

    slug: {
        type: String
    },

    comments: [{
        type: Schema.Types.ObjectId,
        ref: "comments"
    }]

}, {usePushEach: true});

// Create a text index on the content field
PostSchema.index({ title: "text", body: "text", email: "text"});

// Define a custom function to generate the slug
function generateSlug(title) {
    return new Promise(async (resolve, reject) => {
        try {
            let slug = title.replace(/\s+/g, '-');
            let count = 0;

            while (await isSlugTaken(slug)) {
                count++;
                slug = `${title.replace(/\s+/g, '-')}-${count}`;
            }

            resolve(slug);
        } catch (error) {
            reject(error);
        }
    });
}

// Function to check if a slug is already taken
async function isSlugTaken(slug) {
    const existingPost = await mongoose.model('posts').findOne({ slug });
    return !!existingPost;
}


// Use pre-save middleware to generate the slug before saving
PostSchema.pre("save", async function(next) {
    try {
        if (!this.slug) {
            this.slug = await generateSlug(this.title);
        }
        next();
    } catch (error) {
        next(error);
    }
});


module.exports = mongoose.model("posts", PostSchema);
