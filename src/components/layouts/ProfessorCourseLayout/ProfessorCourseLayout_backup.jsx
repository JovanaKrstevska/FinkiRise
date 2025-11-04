// This is a backup - the main file has chunking but needs the upload logic fixed
// The issue is that large files (>1MB) cause Firestore errors
// Solution: Split files into 900KB chunks and store in separate collection