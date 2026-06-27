---
title: "Axolotl — SunLab@Cambridge"
source_url: "https://camsunlab.com/project-axolotl"
lastmod: "2025-04-18"
slug: "project-axolotl"
---
# Axolotl — SunLab@Cambridge
Source: https://camsunlab.com/project-axolotl
Last modified: 2025-04-18
## Extracted text
New approaches to material synthesis with customizable and open source robotics

Axolotl is our customizable robot with its backbone from the 3D printing kit “Jubilee” developed at UW Human Centered Design and Engineering. It has integrated parts from multiple platforms such as the pipette from Opentrons OT-2, an Arducam camera from Arduino kits, and photoluminescence sensors from Ocean Optics. We are also developing custom tools to add onto Axolotl to explore a larger variety of materials to synthesis.

Videos

Related Projects

Building Jubilee

We started this building Jubilee from a kit provided by Filastruder. All the necessary tools such as the frame, back panels, and motors were provided in the kit. We assembled each section from the individual components. The primary assembly instructions were provided by the Jubilee Wiki. In total, the team spent approximately 30 hours fully assembling the Jubilee.

Color Mixing

We developed a straightforward color-mixing experiment to demonstrate Axo’s capabilities in material synthesis and chemical workflow execution. Using Cyan, Magenta, Yellow, and Black watercolors, various colors were mixed randomly. The resulting colors were captured by a Raspberry Pi camera, which recorded their RGB values for subsequent analysis.

End-to-End Robotic Color Optimization

This project demonstrates a fully automated, machine learning–driven color-mixing pipeline using the Axo robotic platform. A user specifies a target color, which is captured via an Arducam IMX477 camera through a live-streaming server (with local fallback). Axo dispenses randomly generated color mixtures into a well plate, identifies each well using the Hough Transform, and extracts RGB values. These values are evaluated using a color theory–based objective function and are used to train a Gaussian Process model. A Bayesian optimization algorithm iteratively refines the primary color volumes to match the target, enabling closed-loop, intelligent experimentation.

End-to-End Robotic Color Optimization

Slide 1

Slide 1 (current slide)
## Images
- [Project_Axolotl](../media/130-726e45dd58.png) — https://images.squarespace-cdn.com/content/v1/64bc55503de4ca604bd09dac/ebe2595a-223f-40e7-9c13-4d62e2c4a50d/workflow3.png — End-to-End Robotic Color Optimization