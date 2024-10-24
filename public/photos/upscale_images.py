import os
import subprocess

def upscale_images_in_directory():
    # Get the current working directory
    current_directory = os.getcwd()

    # Define the path to the realesrgan executable
    realesrgan_executable = os.path.join(current_directory, 'realesrgan-ncnn-vulkan')

    # Loop through files in the current directory
    for file_name in os.listdir(current_directory):
        # Only process image files
        if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            input_path = os.path.join(current_directory, file_name)
            output_path = os.path.join(current_directory, f"upscaled_{file_name}")
            
            # Construct the command for each image
            command = f"{realesrgan_executable} -i {input_path} -o {output_path}"
            
            # Run the command using subprocess
            subprocess.run(command, shell=True)
            print(f"Upscaled {file_name} to {output_path}")

if __name__ == "__main__":
    upscale_images_in_directory()
