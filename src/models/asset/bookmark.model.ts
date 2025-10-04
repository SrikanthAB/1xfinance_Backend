import { Document, Schema, model } from 'mongoose'

export interface IBookmark extends Document {
    assetId: Schema.Types.ObjectId,
    investorId: Schema.Types.ObjectId,
    createAt:Date;
}

const BookmarkSchema = new Schema<IBookmark>({
    assetId: {
        type: Schema.Types.ObjectId,
        ref: 'Asset',
        required: true
    },
    investorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps:{createdAt:true}});

BookmarkSchema.index({ investorId: 1, assetId: 1 }, { unique: true });

const Bookmark = model<IBookmark>("Bookmark",BookmarkSchema);
export default Bookmark;