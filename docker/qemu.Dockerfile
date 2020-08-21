FROM scratch
LABEL description="Allow images to run on x86"

# add qemu so we can build from x86
COPY qemu-arm-static /
