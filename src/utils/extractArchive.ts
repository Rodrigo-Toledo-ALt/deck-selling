// utils/extractArchive.ts
import JSZip from "jszip";
import { createExtractorFromFile } from "unrar.js";

// Reusamos tu convertToJpg (lo muevo aquí también)
export async function convertToJpg(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Canvas context not available");

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject("Conversion failed");
                    const newFile = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    resolve(newFile);
                },
                "image/jpeg",
                quality
            );
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

export async function extractArchive(file: File): Promise<File[]> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    let files: File[] = [];

    if (ext === "zip") {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        for (const [filename, entry] of Object.entries(zip.files)) {
            if (entry.dir) continue;
            const blob = await entry.async("blob");
            let newFile = new File([blob], filename, { type: blob.type || "application/octet-stream" });

            if (newFile.type === "image/png") {
                newFile = await convertToJpg(newFile, 0.85);
            }
            files.push(newFile);
        }
    } else if (ext === "rar") {
        const extractor = await createExtractorFromFile({ file });
        const { files: rarFiles } = extractor.extract({});

        for (const entry of rarFiles) {
            if (entry.fileHeader.flags.directory) continue;
            const content = entry.extraction; // Uint8Array
            let newFile = new File([content], entry.fileHeader.name);

            if (newFile.type === "image/png") {
                newFile = await convertToJpg(newFile, 0.85);
            }
            files.push(newFile);
        }
    } else {
        throw new Error("Unsupported archive format. Use .zip or .rar");
    }

    return files;
}