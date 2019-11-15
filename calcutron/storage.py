from whitenoise.storage import CompressedManifestStaticFilesStorage


class LessStrictStorage(CompressedManifestStaticFilesStorage):
    manifest_strict = False
