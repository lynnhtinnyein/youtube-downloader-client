"use client";
import React, { useState } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box,
    Card,
    CardContent,
    CardMedia,
    LinearProgress,
    MenuItem,
    Select,
    SelectChangeEvent,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    YouTube as YoutubeIcon,
    Download as DownloadIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import axios from "axios";

const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const YouTubeDownloader: React.FC = () => {
    const [videoUrl, setVideoUrl] = useState<string>("");
    const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<VideoQuality | null>(null);
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    //methods
        const getVideoDetails = async () => {
            setStatus("fetching");
            setError(null);
            try {
                const response = await axios.post(`${apiUrl}/download`, { videoUrl });
                const details = await response.data;
                setVideoDetails(details.videoDetails);
                setStatus("idle");

                if (details.videoDetails.availableQualities.length > 0) {
                    setSelectedQuality(details.videoDetails.availableQualities[0]);
                }
            } catch (err) {
                setError(err.message);
                setStatus("error");
                setOpenSnackbar(true);
            }
        };

        const downloadToMachine = (data) => {
            const url = window.URL.createObjectURL(new Blob([data]));
            const a = document.createElement("a");
            a.href = url;
            a.download = `${videoDetails.title}.mp4`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        };

        const download = async () => {
            if (!videoDetails) return;
            setStatus("downloading");
            setDownloadProgress(0);

            try {
                const res = await axios.put(
                    `${apiUrl}/download`,
                    {
                        videoUrl,
                        title: videoDetails.title,
                        quality: selectedQuality?.itag,
                    },
                    {
                        responseType: "blob",
                        onDownloadProgress: (progressEvent) => {
                            if (selectedQuality.contentLength && progressEvent.loaded) {
                                const progress = Math.round(
                                    (progressEvent.loaded / selectedQuality.contentLength) * 100
                                );
                                setDownloadProgress(progress);
                                if (progress === 100) {
                                    setStatus("completed");
                                }
                            }
                        },
                    }
                );

                downloadToMachine(res.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setStatus("error");
                setOpenSnackbar(true);
            }
        };

        const handleQualityChange = (event: SelectChangeEvent<string>) => {
            const selectedTag = event.target.value;
            const quality = videoDetails?.availableQualities.find((q) => q.itag === selectedTag);
            setSelectedQuality(quality || null);
        };

        const handleCloseSnackbar = (event: React.SyntheticEvent | Event, reason?: string) => {
            if (reason === "clickaway") {
                return;
            }
            setOpenSnackbar(false);
        };

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                minHeight: "100vh",
                py: 4,
            }}
        >
            <Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <YoutubeIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h4" component="h1" color="primary" gutterBottom>
                        YouTube Downloader
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    variant="outlined"
                    label="YouTube Video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={status === "fetching" || status === "downloading"}
                />

                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={getVideoDetails}
                    disabled={!videoUrl || status === "fetching" || status === "downloading"}
                    sx={{ mb: 2 }}
                >
                    {status === "fetching" ? "Searching..." : "Search"}
                </Button>

                {videoDetails && (
                    <>
                        <Card sx={{ mb: 2 }}>
                            <CardMedia
                                component="img"
                                height="140"
                                image={videoDetails.thumbnail}
                                alt="Video Thumbnail"
                            />
                            <CardContent>
                                <Typography variant="h6" noWrap>
                                    {videoDetails.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {videoDetails.author} • {Math.floor(videoDetails.length / 60)}{" "}
                                    mins
                                </Typography>
                            </CardContent>
                        </Card>

                        {videoDetails.availableQualities.length > 0 && (
                            <Select
                                fullWidth
                                value={selectedQuality?.itag || ""}
                                onChange={handleQualityChange}
                                sx={{ mb: 2 }}
                            >
                                {videoDetails.availableQualities.map((quality) => (
                                    <MenuItem key={quality.itag} value={quality.itag}>
                                        {quality.quality} - {formatFileSize(quality.contentLength)}{" "}
                                        {quality.contentLength}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}

                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<DownloadIcon />}
                            onClick={download}
                            disabled={status === "downloading" || status === "completed"}
                        >
                            Download Video ({selectedQuality?.quality ?? "Highest"})
                        </Button>
                    </>
                )}

                {selectedQuality?.contentLength && (status === "downloading" || status === "completed") ? (
                    <Box sx={{ width: "100%", mt: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={downloadProgress}
                            color={status === "completed" ? "success" : "primary"}
                        />
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            align="center"
                            sx={{ mt: 1 }}
                        >
                            {downloadProgress}% Downloaded
                        </Typography>
                    </Box>
                ) : ''}

                {status === "completed" && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "success.main",
                            mt: 2,
                        }}
                    >
                        <CheckCircleIcon sx={{ mr: 1 }} />
                        <Typography variant="body1">Download Complete!</Typography>
                    </Box>
                )}
            </Box>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: "100%" }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default YouTubeDownloader;
