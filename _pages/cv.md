---
layout: archive
title: "CV"
permalink: /cv/
author_profile: true
redirect_from:
  - /resume
---

{% include base_path %}

## Education

<ul class="timeline">
  <li><span class="timeline__year">2025</span><div><strong>Ph.D.</strong>, Zhejiang University</div></li>
  <li><span class="timeline__year">2019</span><div><strong>Bachelor's degree</strong>, Nanchang University</div></li>
</ul>

## Research interests

Bayesian inference and model updating · Bayesian evidence estimation · Rare-event simulation and structural reliability · Importance sampling, subset simulation and MCMC · Machine learning for spectroscopy

## Publications

<ol class="pub-list">
  {% assign pubs = site.data.publications | sort: "year" | reverse %}{% for pub in pubs %}{% include publication-item.html pub=pub %}{% endfor %}
</ol>

## Open-source code

{% include code-list.html %}
