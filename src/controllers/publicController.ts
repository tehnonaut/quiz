import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';

export const getTemplatePage = (req: Request, res: Response) => {
	// 1. Convert req.params to an array, filtering out any undefined, and remove any that have ..
	const slugsArray = Object.values(req.params)
		.filter(Boolean)
		.filter((slug) => !slug.includes('..'));

	// 2. If the last slug is a 24-hex string, replace it with the previous slug
	if (slugsArray.length > 1) {
		const lastSlug = slugsArray[slugsArray.length - 1];
		const secondToLastSlug = slugsArray[slugsArray.length - 2];

		const is24Hex = /^[0-9a-f]{24}$/i.test(lastSlug);
		if (is24Hex) {
			// Replace the last slug with the second-to-last slug
			slugsArray[slugsArray.length - 1] = secondToLastSlug;
		}
	}

	// 3. Join the slugs again (could be 'quiz/quiz' now instead of 'quiz/677c2e1cc15e58a2bc362ec2')
	const joinedSlugs = slugsArray.join('/');

	// 4. Determine the base "views" directory
	const viewsRoot = process.env.DIR_ROOT ? path.join(process.env.DIR_ROOT, 'views') : path.join(__dirname, 'views');

	// 5. Build the candidate EJS paths in priority order
	const ejsPaths = [path.join(viewsRoot, `${joinedSlugs}.ejs`), path.join(viewsRoot, joinedSlugs, 'index.ejs')];

	// 6. Find the first file that exists
	const validEjsPath = ejsPaths.find(fs.existsSync);

	if (!validEjsPath) {
		// Return 404 if none found
		res.status(404).send('Page not found');
		return;
	}

	// 7. Convert absolute path to path relative to `viewsRoot`
	const relativePath = path.relative(viewsRoot, validEjsPath).replace(/\\/g, '/');

	// 8. Render the EJS template
	res.render(relativePath);
	return;
};
