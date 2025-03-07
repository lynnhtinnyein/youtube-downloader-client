interface VideoQuality {
    itag: string;
    quality: string;
    contentLength: number;
}

interface VideoDetails {
    title: string;
    author: string;
    length: number;
    thumbnail: string;
    availableQualities: VideoQuality[];
    filePath?: string;
}

declare type Status = "idle" | "fetching" | "downloading" | "completed" | "error";