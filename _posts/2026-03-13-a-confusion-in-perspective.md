---
title: "A confusion in perspctive"
categories:
  - Mathematics
tags:
  - matrices
  - transformations
  - rant
layout: post
---
 
 This post serves as a post-ohno rambling of some ideas that just "clicked" in my mind -- sometime between 3 a.m. and 4 a.m. on a Thursday morning -- while tossing and turning in my bed, in awe of the sheer stupidity of what I had done in my Image Signal Processing midsem. Somehow in those wee hours my brain decided connect the dots about my various ways of thinking about change of co-ordinate systems, warping the world around you, matrix representations of transformations and so on and so forth. 

> I feel like I used to be adept at these ideas quite a while ago when I was in high-school, but alas it only took me a few years for the rust to settle in. I'll try to build up the same ideas which I could look back to later on and build up the same intuition, in case my brain decides that it is time to forget all common sense once again. And to you from the future -- it was a good idea to document this.

<figure>
  <img 
    src="/assets/images/posts/a-confusion-in-perspective/inception.jpg"
    alt="A frame from the movie Inception (2010)">
  <figcaption>
    A frame from the movie <a href="https://www.sciencemuseum.org.uk/see-and-do/inception">Inception (2010)</a> (felt apt)
  </figcaption>
</figure>

---

# Playing God or Cameraman

Firstly, you need to distinguish between two kinds of transformations that you could perform in a world. I'd like to classify them into two kinds:

 - **Active**: Where you are playing God and can twist and warp the world around you as you see fit.
 - **Passive**: Where you are just a guy with a Camera, not changing the world but observing the world around with a newfound sense of a pose

For example, you have a camera $C$ in the scene in a certain pose observing an object $O$. Now, you apply an Affine transformation $\mathcal{T}$ to the object $O$ and the rest of the world is unchanged when viewed through your only entry to the world, $C$. This is an active transformation. If instead you applied a Euclidean transform to $C$'s pose and leave the world untouched, you are performing a passive transformation.

Although one may argue that matrices don't treat the two any differently, it helps to keep track of the nature of each transformation that you are composing through a big matrix chain acting on a co-ordinate. It would save you pain of pondering over the phrase 

> *"To invert or to not invert... that is the question!"*
> -- Not Hamlet

# The Answer

***Idea 1:*** *You moving to the right is as good as the world moving to the left. If the camera pose was acted upon by $\mathcal{T}$, it is as good as $\mathcal{T}^{-1}$ (shut up and assume it exists) acting on the entire world and the camera staying put.*

Say in world co-ordinates, there's a unit sphere $S$ centred at (1,2,3) and there's a camera $C$ at (1,0,0). Then you could represent the pose of $S$ as that of a origin centred unit sphere having undergone $M_\text{sph}$ and a "default" camera pose having undergone $M_\text{cam}$ where

$$
M_\text{sph} = \begin{pmatrix} 1 & 0 & 0 & 1 \\ 0 & 1 & 0 & 2 \\ 0 & 0 & 1 & 3 \\ 0 & 0 & 0 & 0 \end{pmatrix}
\quad
M_\text{cam} = \begin{pmatrix} 1 & 0 & 0 & 1 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 0 \end{pmatrix}
$$

So, to answer the big question, ask yourself these two smaller questions:
1. What is the co-ordinate that I am after?
2. What happened to me and what happened to the world?

Say now you wish to find the co-ordinates of the centre of $S$ as seen by $C$ (that is we want the camera co-ordinates). The answer to the first question is pretty clear here. The second question's answer -- the world (an origin centred unit sphere) was transformed by $M_\text{sph}$ and you were transformed by $M_\text{cam}$. 

***Idea 2:*** *The world exists. You are merely observing it. You bring the world to the state that it wants to be in, and then you look at it the way you want.*

Represent the centre of the origin centred sphere using the normalized world co-ordinates $P =\begin{pmatrix} 0 & 0 & 0 & 1 \end{pmatrix}^T$. This is an active transform. The world has been warped and the new centre is now $M_\text{sph}P$. *Use Idea 2.* Now the world is set. You are observing it. While $M_\text{cam}$ is an active transformation of the camera pose, observing the warped world through the new pose (as opposed to the world frame) is a passive transform.  *Use Idea 1.* The co-ordinates with respect to the new camera pose would be $M_\text{cam}^{-1}M_\text{sph}P$.

Does this make sense? The matrix multiplication yields $\begin{pmatrix} 0 & 2 & 3 & 1 \end{pmatrix}^T$, which in fact is the subtraction of the centre of the sphere from the centre of the camera. It indeed does!

***Idea 3:*** Active transforms are applied as is. Passive transforms are applied with an inverse (and these inverses exist, hopefully).

# A primer on change of bases

Never forget what a matrix is. The matrix corresponding to a finite dimenstional linear transform contains *elements* (not rows or columns) which represent where the bases of your world end up when the transformation is applied actively/passively to it. 

Cool! It is easy to recognize just by performing matrix multiplication that the *columns represent where the bases end up* on applying an *active transformation*. 

$$
\begin{pmatrix} x' \\ y' \\ z' \end{pmatrix} = \begin{pmatrix} a & b & c \\ d & e & f \\ g & h & i \end{pmatrix} \begin{pmatrix} x \\ y \\ z \end{pmatrix} = \begin{pmatrix} a \\ d \\ g \end{pmatrix} x + \begin{pmatrix} b \\ e \\ h \end{pmatrix} y + \begin{pmatrix} c \\ f \\ i \end{pmatrix} z
$$

What does it mean for passive transformations though? A bit more work, but for orthogonal transforms it is the *rows* that represent what the new bases are!


$$
\begin{pmatrix} x \\ y \\ z \end{pmatrix} = \begin{pmatrix} a & b & c \\ d & e & f \\ g & h & i \end{pmatrix}^{-1} \begin{pmatrix} x' \\ y' \\ z' \end{pmatrix} = \begin{pmatrix} a & d & g \\ b & e & h \\ c & f & i \end{pmatrix} \begin{pmatrix} x' \\ y' \\ z' \end{pmatrix} = \begin{pmatrix} a \\ b \\ c \end{pmatrix} x' + \begin{pmatrix} d \\ e \\ g \end{pmatrix} y' + \begin{pmatrix} g \\ h \\ i \end{pmatrix} z'
$$


# To you in (>2026)

Read this over and over again until you feel enlightened. Thanks and don't ruin your sleep schedule!