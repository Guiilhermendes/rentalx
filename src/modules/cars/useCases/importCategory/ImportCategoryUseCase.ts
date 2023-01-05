import fs from 'fs';
import { parse as csvParse } from 'csv-parse';
import { ICategoriesRepository } from '../../repositories/ICategoriesRepository';

interface IImportCategory {
    name: string;
    description: string;
}

class ImportCategoryUseCase {
    constructor(private categoriesRepository: ICategoriesRepository) { }

    //ASYNC AWAIT METHOD
    // async loadCategories(file: Express.Multer.File): Promise<IImportCategory[]> {
    //     const stream = fs.createReadStream(file.path);
    //     const categories: IImportCategory[] = [];

    //     const parseFile = csvParse();

    //     stream.pipe(parseFile);

    //     for await (const chunk of parseFile) {
    //         const [name, description] = chunk
    //         categories.push({ name, description })
    //     }

    //     return categories;
    // }

    async loadCategories(file: Express.Multer.File): Promise<IImportCategory[]> {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(file.path);
            const categories: IImportCategory[] = [];

            const parseFile = csvParse();

            stream.pipe(parseFile);

            parseFile.on("data", (line) => {
                const [name, description] = line;
                categories.push({ name, description });
            }).on("end", () => {
                resolve(categories);
            }).on("error", (err) => {
                reject(err)
            });
        });
    }

    async execute(file: Express.Multer.File): Promise<void> {
        const categories = await this.loadCategories(file);

        categories.map((category) => {
            const { name, description } = category;

            const existCategory = this.categoriesRepository.findByName(name);
            if (existCategory) return console.log(`Category ${name} alredy exists`);

            this.categoriesRepository.create({ name, description })
        })
    }
}

export { ImportCategoryUseCase }