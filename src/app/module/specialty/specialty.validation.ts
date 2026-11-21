import z from "zod";

const specialtyFields = {
    title: z.string("Title must be a string").min(2, "Title must be at least 2 characters").max(100, "Title must be at most 100 characters"),
    description: z.string("Description must be a string").max(1000, "Description must be at most 1000 characters").optional(),
    icon: z.url("Icon must be a valid URL").optional(),
};

const createSpecialtyZodSchema = z.object({
    ...specialtyFields,
    title: specialtyFields.title,
});

const updateSpecialtyZodSchema = z.object({
    title: specialtyFields.title.optional(),
    description: specialtyFields.description,
    icon: specialtyFields.icon,
});

export const SpecialtyValidation = {
    createSpecialtyZodSchema,
    updateSpecialtyZodSchema,
};
