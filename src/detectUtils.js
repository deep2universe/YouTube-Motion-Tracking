/**
 * Transformer for the detector keypoints
 * This allows you to move and scale the keypoints before drawing them.
 *
 * @param keypoints original keypoints from detector
 * @param mainVideo video element
 * @param scaleX scale in x direction
 * @param scaleY scale in y direction
 * @param shiftX shift in x direction
 * @param shiftY shift in y direction
 * @returns {*[]} new array with transformed keypoints
 */
function transformKeypointsForRender(keypoints, mainVideo, canvas, scaleX = 1, scaleY = 1, shiftX = 0, shiftY = 0) {

    let offsetWidth = mainVideo.offsetWidth;
    let offsetHeight = mainVideo.offsetHeight;
    scaleX = offsetWidth / mainVideo.videoWidth * scaleX;
    scaleY = offsetHeight / mainVideo.videoHeight * scaleY;


    let canvasCoordinates = [];
    for (let kp of keypoints) {
        let {x, y, score, name} = kp; // Destructure 'name' as well
        canvasCoordinates.push({
            x: scaleX * canvas.width * x / mainVideo.clientWidth + shiftX,
            y: scaleY * canvas.height * y / mainVideo.clientHeight + shiftY,
            score: score,
            name: name // Add the name property
        });
    }
    return canvasCoordinates;
}

export {transformKeypointsForRender};
