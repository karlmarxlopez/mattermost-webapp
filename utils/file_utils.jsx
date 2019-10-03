// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import exif2css from 'exif2css';

import Constants from 'utils/constants.tsx';
import * as UserAgent from 'utils/user_agent';

export function canUploadFiles(config) {
    const enableFileAttachments = config.EnableFileAttachments === 'true';
    const enableMobileFileUpload = config.EnableMobileFileUpload === 'true';

    if (!enableFileAttachments) {
        return false;
    }

    if (UserAgent.isMobileApp()) {
        return enableMobileFileUpload;
    }

    return true;
}

export function canDownloadFiles(config) {
    if (UserAgent.isMobileApp()) {
        return config.EnableMobileFileDownload === 'true';
    }

    return true;
}

export function trimFilename(filename) {
    let trimmedFilename = filename;
    if (filename.length > Constants.MAX_FILENAME_LENGTH) {
        trimmedFilename = filename.substring(0, Math.min(Constants.MAX_FILENAME_LENGTH, filename.length)) + '...';
    }

    return trimmedFilename;
}

export function getFileTypeFromMime(mimetype) {
    const mimeTypeSplitBySlash = mimetype.split('/');
    const mimeTypePrefix = mimeTypeSplitBySlash[0];
    const mimeTypeSuffix = mimeTypeSplitBySlash[1];

    if (mimeTypePrefix === 'video') {
        return 'video';
    } else if (mimeTypePrefix === 'audio') {
        return 'audio';
    } else if (mimeTypePrefix === 'image') {
        return 'image';
    }

    if (mimeTypeSuffix) {
        if (mimeTypeSuffix === 'pdf') {
            return 'pdf';
        } else if (mimeTypeSuffix.includes('vnd.ms-excel') || mimeTypeSuffix.includes('spreadsheetml') || mimeTypeSuffix.includes('vnd.sun.xml.calc') || mimeTypeSuffix.includes('opendocument.spreadsheet')) {
            return 'spreadsheet';
        } else if (mimeTypeSuffix.includes('vnd.ms-powerpoint') || mimeTypeSuffix.includes('presentationml') || mimeTypeSuffix.includes('vnd.sun.xml.impress') || mimeTypeSuffix.includes('opendocument.presentation')) {
            return 'presentation';
        } else if ((mimeTypeSuffix === 'msword') || mimeTypeSuffix.includes('vnd.ms-word') || mimeTypeSuffix.includes('officedocument.wordprocessingml') || mimeTypeSuffix.includes('application/x-mswrite')) {
            return 'word';
        }
    }

    return 'other';
}

// based on https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side/32490603#32490603
export function getExifOrientation(data) {
    var view = new DataView(data);

    if (view.getUint16(0, false) !== 0xFFD8) {
        return -2;
    }

    var length = view.byteLength;
    var offset = 2;

    while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;

        if (marker === 0xFFE1) {
            if (view.getUint32(offset += 2, false) !== 0x45786966) {
                return -1;
            }

            var little = view.getUint16(offset += 6, false) === 0x4949;
            offset += view.getUint32(offset + 4, little);
            var tags = view.getUint16(offset, little);
            offset += 2;

            for (var i = 0; i < tags; i++) {
                if (view.getUint16(offset + (i * 12), little) === 0x0112) {
                    return view.getUint16(offset + (i * 12) + 8, little);
                }
            }
        } else if ((marker & 0xFF00) === 0xFF00) {
            offset += view.getUint16(offset, false);
        } else {
            break;
        }
    }
    return -1;
}

export function getOrientationStyles(orientation) {
    const {
        transform,
        'transform-origin': transformOrigin,
    } = exif2css(orientation);
    return {transform, transformOrigin};
}
