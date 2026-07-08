# Architecture

Este documento describe la arquitectura conceptual de Vero Quant Lab. No define implementación, infraestructura ni integraciones concretas.

## Workspace

Workspace es la pantalla inicial y el centro de operaciones de Vero Quant Lab.

Su responsabilidad es orientar a la usuaria hacia las áreas principales del producto: Research, Trading, Academy, Knowledge y AI Copilot. No es un dashboard de métricas. Debe funcionar como punto de entrada, estado general del sistema y superficie de continuidad del trabajo.

## Trading Engine

Trading Engine será el módulo encargado de las capacidades relacionadas con trading.

Por decisión arquitectónica, vivirá en un repositorio separado. Vero Quant Lab podrá exponer accesos, estados o superficies de integración, pero la lógica principal del engine no pertenece a este repositorio.

## Research

Research es el módulo para investigación, hipótesis, experimentos y análisis cuantitativo.

Debe organizar el trabajo investigativo con trazabilidad desde la idea inicial hasta conclusiones reutilizables. Su foco es disciplina analítica, documentación y preparación para decisiones futuras.

## Academy

Academy es el módulo para creación y evolución del contenido educativo.

Debe soportar la planificación de cursos, módulos, lecciones y materiales asociados. Su arquitectura debe separar contenido educativo de investigación operativa y de documentación técnica.

## Knowledge

Knowledge es el módulo para documentación, arquitectura, referencias y conocimiento reutilizable.

Debe funcionar como una base organizada de conceptos, decisiones, guías y material estructural. Su objetivo es reducir pérdida de contexto y facilitar continuidad del proyecto.

## AI Copilot

AI Copilot es un módulo planificado.

Su responsabilidad futura será asistir en flujos internos de Vero Quant Lab, pero no debe implementarse hasta existir una SPEC concreta que defina alcance, límites, datos, comportamiento y criterios de aceptación.
