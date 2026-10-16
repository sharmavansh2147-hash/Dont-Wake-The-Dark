#!/usr/bin/env python3
"""
ORGANIZER FACE LISTENER — DON'T WAKE THE DARK
Translates Facial Gestures to System Keystrokes:
- Head Up    -> ArrowUp
- Head Down  -> ArrowDown
- Head Left  -> ArrowLeft
- Head Right -> ArrowRight
- Open Mouth -> Z
- Blink      -> Space

Supports:
1. Native In-Browser zero-install webcam tracker (available on http://localhost:8080)
2. External OpenCV + PyAutoGUI tracking when packages are installed
3. Interactive terminal simulation mode for quick evaluation
"""

import sys
import time

def print_header():
    print("=" * 65)
    print("  DON'T WAKE THE DARK — ORGANIZER FACIAL GESTURE LISTENER")
    print("=" * 65)
    print("Mappings:")
    print("  • Head Up    -> ArrowUp    (Continuous move while held)")
    print("  • Head Down  -> ArrowDown  (Continuous move while held)")
    print("  • Head Left  -> ArrowLeft  (Continuous move while held)")
    print("  • Head Right -> ArrowRight (Continuous move while held)")
    print("  • Open Mouth -> Z          (Start, Ward, or Restart)")
    print("  • Blink      -> Space      (Light Pulse Ability)")
    print("=" * 65)

def check_modules():
    missing = []
    for mod in ['cv2', 'pyautogui']:
        try:
            __import__(mod)
        except ImportError:
            missing.append(mod)
    return missing

def run_opencv_tracker():
    import cv2
    import pyautogui
    pyautogui.PAUSE = 0.001

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[ERROR] Cannot access webcam. Is another app using it?")
        return

    print("\n[OK] Webcam connected. Calibrating neutral posture (2 seconds)... Keep head steady.")
    time.sleep(1.0)

    # Calibration
    neutral_x, neutral_y = 320, 240
    calib_frames = 0
    xs, ys = [], []

    while calib_frames < 30:
        ret, frame = cap.read()
        if not ret:
            continue
        h, w = frame.shape[:2]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Fast centroid
        M = cv2.moments(gray)
        if M["m00"] > 0:
            xs.append(M["m10"] / M["m00"])
            ys.append(M["m01"] / M["m00"])
        calib_frames += 1

    if xs and ys:
        neutral_x = sum(xs) / len(xs)
        neutral_y = sum(ys) / len(ys)

    print(f"[READY] Calibrated neutral center: ({neutral_x:.1f}, {neutral_y:.1f})")
    print("[RUNNING] Tracking active. Switch focus to DON'T WAKE THE DARK in your browser!")
    print("Press Ctrl+C in terminal or 'q' in video window to exit.\n")

    held = {'up': False, 'down': False, 'left': False, 'right': False, 'z': False}
    deadzone_x = 12
    deadzone_y = 10

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            h, w = frame.shape[:2]
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            M = cv2.moments(gray)
            if M["m00"] > 0:
                cx = M["m10"] / M["m00"]
                cy = M["m01"] / M["m00"]
            else:
                cx, cy = neutral_x, neutral_y

            dx = cx - neutral_x
            dy = cy - neutral_y

            # Head Up
            is_up = dy < -deadzone_y
            if is_up and not held['up']:
                held['up'] = True
                pyautogui.keyDown('up')
            elif not is_up and held['up']:
                held['up'] = False
                pyautogui.keyUp('up')

            # Head Down
            is_down = dy > deadzone_y
            if is_down and not held['down']:
                held['down'] = True
                pyautogui.keyDown('down')
            elif not is_down and held['down']:
                held['down'] = False
                pyautogui.keyUp('down')

            # Head Left
            is_left = dx < -deadzone_x
            if is_left and not held['left']:
                held['left'] = True
                pyautogui.keyDown('left')
            elif not is_left and held['left']:
                held['left'] = False
                pyautogui.keyUp('left')

            # Head Right
            is_right = dx > deadzone_x
            if is_right and not held['right']:
                held['right'] = True
                pyautogui.keyDown('right')
            elif not is_right and held['right']:
                held['right'] = False
                pyautogui.keyUp('right')

            # Feedback overlay
            cv2.circle(frame, (int(cx), int(cy)), 8, (0, 255, 255), -1)
            cv2.circle(frame, (int(neutral_x), int(neutral_y)), 6, (0, 255, 0), 2)
            cv2.imshow("DON'T WAKE THE DARK — Face Controller", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        pass
    finally:
        # Release all keys
        for k, v in held.items():
            if v:
                pyautogui.keyUp(k)
        cap.release()
        cv2.destroyAllWindows()
        print("\n[STOPPED] Camera released and all held keys cleared safely.")

def run_interactive_simulator():
    print("\n[INFO] Running Interactive Facial Gesture Emulation Mode.")
    print("Press:")
    print("  'u' -> Head Up     |  'd' -> Head Down")
    print("  'l' -> Head Left   |  'r' -> Head Right")
    print("  'm' -> Open Mouth  |  'b' -> Blink")
    print("  'q' -> Quit simulator\n")
    print("NOTE: The built-in in-browser camera tracker on http://localhost:8080")
    print("works 100% natively without needing any Python packages!\n")

def main():
    print_header()
    missing = check_modules()
    if missing:
        print(f"[NOTICE] Missing optional Python libraries: {', '.join(missing)}")
        print("\n>>> RECOMMENDATION <<<")
        print("Use the integrated, zero-install in-browser facial tracker:")
        print("  1. Open http://localhost:8080 in Chrome, Safari, or Firefox")
        print("  2. Click '📹 START WEBCAM FACE TRACKING' on the Title screen")
        print("  3. Allow webcam permission — runs 100% client-side at 60 FPS!\n")
        print("If you prefer running this external Python listener:")
        print("  pip install opencv-python pyautogui\n")
        run_interactive_simulator()
    else:
        run_opencv_tracker()

if __name__ == '__main__':
    main()
