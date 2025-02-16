import mongoose, { Document, Model, Schema, Types } from 'mongoose';

import bcrypt from 'bcrypt';

export interface IUserToken {
	id: string;
	iat?: number;
	exp?: number;
	name: string;
	email: string;
}

export interface IUser extends Document {
	_id: Types.ObjectId;

	name: string;
	email: string;
	password: string; // select: false means that the password will not be returned in the response

	verifiedAt?: Date;
	createdAt: Date;
	updatedAt: Date;

	// methods
	comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
	{
		name: { type: String, trim: true, required: true },
		email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
		password: { type: String, required: true, select: false }, // select: false means that the password will not be returned in the response

		verifiedAt: { type: Date },
	},
	{ timestamps: true }
);

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
	return await bcrypt.compare(password, this.password);
};

const User: Model<IUser> = mongoose.model('User', userSchema);

export default User;
