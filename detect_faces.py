import cv2
import mediapipe as mp

# Load the image
image_path = 'player14.jpg'
image = cv2.imread(image_path)

# Initialize MediaPipe Pose Detection
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)

# Convert the image to RGB as MediaPipe uses RGB images
image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# Perform pose detection
results = pose.process(image_rgb)

if results.pose_landmarks:
    # Extract landmarks for head, arms, shoulders, and hips
    landmarks = results.pose_landmarks.landmark
    
    # Get coordinates of key points for cropping (head, shoulders, hips, and wrists for arms)
    nose = landmarks[mp_pose.PoseLandmark.NOSE]
    left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
    right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
    left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
    right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
    left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
    right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
    
    # Compute the bounding box that includes the entire head, body, and arms
    x_min = min(left_shoulder.x, right_shoulder.x, left_wrist.x, right_wrist.x)
    x_max = max(left_shoulder.x, right_shoulder.x, left_wrist.x, right_wrist.x)
    y_min = nose.y  # Start cropping from the nose
    y_max = max(left_hip.y, right_hip.y)  # Crop until the hips
    
    # Convert normalized coordinates to pixel values
    h, w, _ = image.shape
    x_min_pixel = int(x_min * w)
    x_max_pixel = int(x_max * w)
    y_min_pixel = int(y_min * h)
    y_max_pixel = int(y_max * h)
    
    # Add padding to include hair above the head and full arms
    head_padding = int(0.3 * (y_max_pixel - y_min_pixel))  # Add more space above the head (15% of the height)
    arm_padding = int(0.1 * (x_max_pixel - x_min_pixel))   # Add padding to include full arms (5% of width)
    
    y_min_pixel = max(0, y_min_pixel - head_padding)  # Extend upwards for the hair
    x_min_pixel = max(0, x_min_pixel - arm_padding)  # Extend left for full arms
    x_max_pixel = min(w, x_max_pixel + arm_padding)  # Extend right for full arms

    # Crop the image to contain the head, body, and arms
    cropped_image = image[y_min_pixel:y_max_pixel, x_min_pixel:x_max_pixel]

    # Show the cropped image
    cv2.imshow('Cropped Head, Body, and Arms', cropped_image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

    # Optionally, save the cropped image
    cv2.imwrite('cropped_player_head_body_arms.jpg', cropped_image)
else:
    print("No pose landmarks detected")

# Release resources
pose.close()
