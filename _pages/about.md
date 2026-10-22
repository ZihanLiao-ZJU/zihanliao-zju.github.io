---
permalink: /
title: "Zihan Liao"
author_profile: true
redirect_from:
  - /about/
  - /about.html
---

{% include base_path %}

<p class="hero__kicker">Reliability estimation · Bayesian updating · Machine Learning · Spectral analysis</p>

I study how to make probabilistic computation reliable when it is hard: estimating very small failure probabilities, computing Bayesian evidence, and sampling posteriors that are high-dimensional or have several separated modes. Much of my work borrows ideas from structural reliability, such as subset simulation and sequential importance sampling, and turns them into general-purpose samplers for Bayesian updating. I also apply machine learning to quantitative surface-enhanced Raman spectroscopy.

I received my Ph.D. from [Zhejiang University](https://www.zju.edu.cn/english/) in 2025 and my bachelor's degree from [Nanchang University](https://www.ncu.edu.cn/) in 2019. The code for my papers is open source on [GitHub](https://github.com/{{ site.author.github }}).

**Email:** [{{ site.author.email }}](mailto:{{ site.author.email }})

## Education

<ul class="timeline">
  <li><span class="timeline__year">2025</span><div><strong>Ph.D.</strong>, Zhejiang University</div></li>
  <li><span class="timeline__year">2019</span><div><strong>Bachelor's degree</strong>, Nanchang University</div></li>
</ul>

## Publications

{% include publication-list.html %}

<p class="more-link">See also my <a href="{{ site.author.googlescholar }}">Google Scholar profile</a>.</p>

## Open-source code

{% include code-list.html %}


## Datasets

Open experimental datasets from structural vibration tests I participated in, published with my collaborators on Harvard Dataverse.

{% include dataset-list.html %}
