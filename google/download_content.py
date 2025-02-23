import os
import csv
import json
import hashlib

from dataclasses import dataclass
from enum import Enum
from argparse import ArgumentParser
from PIL import Image, ImageFilter

import google.oauth2.service_account as service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']


PARENT_DIRECTORY_ID = '1JWZ4WcU8ZIxZqXa2Xxods5DnjN94O-Ju'
"""
The ID of the top-level directory in Google Drive
"""

MAX_LARGE_IMAGE_SIZE = 1920
"""
The maximum size of an image
"""

MAX_MEDIUM_IMAGE_SIZE = 640
"""
The maximum size of an image, when scaled to be shown in a gallery
"""

MAX_PREVIEW_IMAGE_SIZE = 128
"""
The maximum size of a preview version of an image
"""

PREVIEW_BLUR_AMOUNT = 0.03
"""
The amount of blur to apply when generating the preview image
"""


class DriveItemType(Enum):
    """
    Types of items in Google Drive
    """
    DIRECTORY = 'directory'
    DOCUMENT = 'document'
    SHEET = 'sheet'
    IMAGE = 'image'
    VIDEO = 'video'


@dataclass
class DriveItemInfo:
    """
    Information about an item in Google Drive
    """

    item_id: str
    """
    The item ID
    """

    item_type: DriveItemType
    """
    The item type 
    """

    parent_id: str | None
    """
    The ID of the parent (directory) or None if top-level
    """

    name: str
    """
    The name of the item
    """

    description: str | None
    """
    A short description of the item
    """

    metadata: dict
    """
    Arbitrary metadata - depends on the item type
    """


@dataclass
class CommandLineArguments:
    """
    Command-line arguments
    """

    credentials_file: str
    """
    The path to the service account credentials JSON file 
    """

    output_dir: str
    """
    The path to the output directory
    """


def _parse_command_line_arguments() -> CommandLineArguments:
    """
    Parses the commandline argument
    """
    parser = ArgumentParser('download_content.py',
                            description='Downloads the content of the website from Google Drive')

    parser.add_argument('--credentials', '-c',
                        help='The service account credentials JSON file',
                        default='credentials.json')

    parser.add_argument('--output-dir', '-o',
                        help='The output directory',
                        default='./content')

    args = parser.parse_args()

    return CommandLineArguments(
        credentials_file=os.path.abspath(os.path.expanduser(args.credentials)),
        output_dir=os.path.abspath(os.path.expanduser(args.output_dir))
    )


def _drive_service(credentials: service_account.Credentials):
    """
    Gets the Google drive service
    """
    return build('drive', 'v3', credentials=credentials)


def _get_drive_items(service) -> dict[str, DriveItemInfo]:
    """
    Gets the  
    """

    items = []
    nextPageToken = None

    fields = [
        'id',
        'name',
        'parents',
        'mimeType',
        'description',
        'imageMediaMetadata',
        'videoMediaMetadata',
        'fileExtension',
        'size',
        'sha256Checksum'
    ]

    while True:

        results = (
            service.files()
            .list(pageSize=10,
                  fields=f"nextPageToken, files({','.join(fields)})",
                  pageToken=nextPageToken,
                  orderBy='name_natural,recency',
                  includeItemsFromAllDrives=True,
                  supportsAllDrives=True)
            .execute()
        )

        nextPageToken = results.get("nextPageToken", None)

        items += results.get("files", [])

        if nextPageToken is None:
            break

    result = {}
    for item in items:
        item_id = item['id']
        name = item['name']
        mime_type = str(item['mimeType'])
        metadata = {}

        if mime_type == 'application/vnd.google-apps.document':
            item_type = DriveItemType.DOCUMENT
        elif mime_type == 'application/vnd.google-apps.spreadsheet':
            item_type = DriveItemType.SHEET
        elif mime_type.startswith('image/'):
            item_type = DriveItemType.IMAGE

            image_metadata = item['imageMediaMetadata']
            metadata['width'] = image_metadata['width']
            metadata['height'] = image_metadata['height']
            metadata['extension'] = item['fileExtension']
            metadata['size'] = item['size']
            metadata['sha256'] = item['sha256Checksum']

        elif mime_type.startswith('video/'):
            item_type = DriveItemType.VIDEO

            video_metadata = item['videoMediaMetadata']
            metadata['width'] = video_metadata['width']
            metadata['height'] = video_metadata['height']
            metadata['duration_ms'] = video_metadata['durationMillis']
            metadata['extension'] = item['fileExtension']
            metadata['size'] = item['size']
            metadata['sha256'] = item['sha256Checksum']

        elif mime_type == 'application/vnd.google-apps.folder':
            item_type = DriveItemType.DIRECTORY
        else:
            print(
                f'Skipping {name} ({item_id}) as it has an unknown type: {mime_type}')

        parent_id = None
        parents = item['parents'] if 'parents' in item else []
        if parents:
            if len(parents) > 1:
                raise RuntimeError(
                    f'Google Drive item "{name}" has {len(parents)} parents. Expected 1.')

            parent_id = parents[0]

        description = None
        if 'description' in item:
            description = item['description']

        result[item_id] = DriveItemInfo(
            item_id=item_id,
            item_type=item_type,
            parent_id=parent_id,
            name=name,
            description=description,
            metadata=metadata
        )

    return result


def _get_directory_id(items: dict[str, DriveItemInfo],
                      names: list[str]) -> str:
    """
    Gets the ID of a directory with the supplied path

    :param items: the dict of all items
    :param names: the path (directory names & file name as a list)

    :return: the item ID
    """
    parent_id = PARENT_DIRECTORY_ID
    for directory_name in names:

        matching_directory_ids = [
            item_id
            for item_id, item_info in items.items()
            if item_info.name == directory_name
            and item_info.parent_id == parent_id
        ]

        if len(matching_directory_ids) != 1:
            raise RuntimeError(f'Failed to find in {"/".join(names)}{os.linesep}'
                               f'Found {len(matching_directory_ids)} directories in Drive matching name: "{directory_name}".')

        parent_id = matching_directory_ids[0]

    return parent_id


def _get_file_id(items: dict[str, DriveItemInfo],
                 names: list[str]) -> str:
    """
    Gets the ID of a file with the supplied path

    :param items: the dict of all items
    :param names: the path (directory names & file name as a list)

    :return: the item ID
    """
    parent_id = _get_directory_id(items, names[:-1])
    file_name = names[-1]

    matching_file_ids = [
        item_id
        for item_id, item_info in items.items()
        if item_info.name == file_name
        and item_info.parent_id == parent_id
    ]

    if len(matching_file_ids) != 1:
        raise RuntimeError(f'Failed to find in {"/".join(names)}{os.linesep}'
                           f'Found {len(matching_file_ids)} files in Drive matching name: "{file_name}".')

    return matching_file_ids[0]


def _get_items_in_dir(items: dict[str, DriveItemInfo],
                      names: list[str]) -> list[str]:
    """
    Gets the IDs of the items that are in the supplied directory

    :param items: the dict of all items
    :param names: the directory names as a list e.g. ['foo', 'bar'] is the path: foo/bar

    :return: the list of items in that directory
    """

    parent_id = _get_directory_id(items, names)

    return [
        item_id
        for item_id, item_info in items.items()
        if item_info.parent_id == parent_id
    ]


def _download_file(service,
                   item_id: str,
                   mime_type='text/markdown') -> bytes:
    """
    Downloads a file Google drive as raw bytes

    :param service: the service
    :param item_id: the item ID
    :param mime_type: the file type

    :return: the file contents
    """

    result = (
        service.files()
        .export(fileId=item_id,
                mimeType=mime_type)
        .execute()
    )

    return result


def _download_text(service,
                   item_id: str) -> str:
    """
    Downloads a document from Google drive as text

    :param service: the service
    :param item_id: the item ID

    :return: the file contents string
    """
    return _download_file(service, item_id,
                          mime_type='text/plain').decode()


def _download_sheet(service,
                    item_id: str) -> list[list[str]]:
    """
    Downloads a sheet from Google drive

    :param service: the service
    :param item_id: the item ID

    :return: the file contents
    """
    csv_text = _download_file(service, item_id,
                              mime_type='text/csv').decode()
    return list(csv.reader(csv_text.splitlines()))


def _check_file_exists(file_path: str,
                       file_size: int,
                       sha256: str) -> bool:
    """
    Check that the file with the supplied path exists, and has the expected size and hash

    :param file_path: the file path
    :param file_size: the size of the file in bytes
    :param sha256: the sha256 hash of the file contents

    :return: True if the file exists, False otherwise
    """
    file_name = os.path.basename(file_path)
    if not os.path.isfile(file_path):
        return False

    if os.path.getsize(file_path) != file_size:
        print(f'{file_name} exists, but has the wrong size. Overwriting.')
        return False

    buffer_size = 65536  # Read input media file in 64 kb chunks
    hasher = hashlib.sha256()

    with open(file_path, 'rb') as file:
        while True:
            data = file.read(buffer_size)
            if not data:
                break

            hasher.update(data)

    if not hasher.hexdigest() == sha256:
        print(f'{file_name} exists, but has the wrong hash. Overwriting.')
        return False

    return True


def _download_media(service,
                    item_id: str,
                    extension: str,
                    file_size: int,
                    sha256: str,
                    output_dir: str) -> str:
    """
    Downloads the image or video with the supplied ID and writes the file into the output directory

    :param service: the service
    :param item_id: the item ID
    :param extension: the file extension
    :param file_size: the size of the file to download (in bytes)
    :param sha256: the sha256 digest of the media file (used to check if file is already downloaded)
    :param ouput_dir: the output directory

    :return: the path to the downloaded file
    """
    file_path = os.path.join(output_dir, f'{item_id}.{extension}')
    if _check_file_exists(file_path, file_size, sha256):
        print(f'{file_path} already exists. Skipping.')
        return file_path

    request = service.files().get_media(fileId=item_id)
    with open(file_path, 'wb') as file:
        downloader = MediaIoBaseDownload(file, request)

        done = False
        show_progress_bar = False
        while done is False:
            status, done = downloader.next_chunk()

            if not done:
                show_progress_bar = True

            if show_progress_bar:
                progress = int(100 * status.progress())
                print(f"{progress:3d}% {progress * '='}",
                      end='\r',
                      flush=True)

                if done:
                    print()

    return file_path


def _get_contact_details(service,
                         items: dict[str, DriveItemInfo]) -> dict:
    """
    Gets the contact details

    :param service: the service
    :param items: the dict of items

    :return: contact details as a dict
    """

    required_keys = ['email', 'instagram']
    result = {
        key: value
        for key, value in _download_sheet(service,
                                          _get_file_id(items, ['contact']))
        if key in required_keys
    }

    for key in required_keys:
        if key not in result:
            raise RuntimeError(f'Contact details are missing: {key}')

    return result


def _get_home_content(service,
                      items: dict[str, DriveItemInfo]) -> dict:
    """
    Gets the content of the home page

    :param service: the service
    :param items: the dict of items

    :return: the home page contents as a dict
    """
    result = {}
    result['bio'] = _download_text(service,
                                   _get_file_id(items, ['home', 'bio']))

    result['introduction'] = _download_text(service,
                                            _get_file_id(items, ['home', 'introduction']))

    result['quotes'] = [
        {
            'quote': quote,
            'name': name
        }
        for quote, name in _download_sheet(service,
                                           _get_file_id(items, ['home', 'quotes']))
    ]

    result['name_checks'] = [
        {
            'name': name,
            'url': url
        }
        for name, url in _download_sheet(service,
                                         _get_file_id(items, ['home', 'name_checks']))
    ]

    result['photos'] = [
        {
            'file_id': photo_info.item_id,
            'name': photo_info.name,
            'description': (photo_info.description or '').strip(),
            **photo_info.metadata
        }
        for photo_info in [
            items[item_id]
            for item_id in _get_items_in_dir(items, ['home', 'images'])
        ]
        if photo_info.item_type == DriveItemType.IMAGE
    ]

    return result


def _get_portfolio_content(items: dict[str, DriveItemInfo]) -> dict:
    """
    Gets the content of the portfolio page

    :param items: the dict of items

    :return: the portfolio page contents as a dict
    """

    portfolio_items = [
        items[item_id]
        for item_id in _get_items_in_dir(items, ['portfolio'])
    ]

    photos = {}
    for item in portfolio_items:
        if item.item_type != DriveItemType.DIRECTORY:
            continue

        album_name = item.name

        album_items = [
            items[item_id]
            for item_id in _get_items_in_dir(items, ['portfolio', album_name])
        ]

        photos[album_name] = [
            {
                'file_id': photo_info.item_id,
                'name': photo_info.name,
                'description': (photo_info.description or '').strip(),
                **photo_info.metadata
            }
            for photo_info in album_items
            if photo_info.item_type == DriveItemType.IMAGE
        ]

    return {
        'photos': photos
    }


def _get_video_content(items: dict[str, DriveItemInfo]) -> list:
    """
    Gets the content of the video page

    :param items: the dict of items

    :return: the video page contents as a list
    """
    video_items = [
        items[item_id]
        for item_id in _get_items_in_dir(items, ['video'])
    ]

    videos = [
        {
            'file_id': video_info.item_id,
            'name': video_info.name,
            'description': (video_info.description or '').strip(),
            **video_info.metadata
        }
        for video_info in video_items
        if video_info.item_type == DriveItemType.VIDEO
    ]

    return {
        'videos': videos
    }


def _write_json_file(content: object,
                     output_dir: str,
                     name: str):
    """
    Writes out data in JSON format

    :param content: the content of to write to the file
    :param output_dir: the output directory
    :param name: the name of the file
    """
    with open(os.path.join(output_dir, name), 'w') as file:
        json.dump(content,
                  file,
                  indent=4)


def _save_resized_image(image: Image,
                        file_name: str,
                        max_size: int,
                        tag: str):
    """
    Save the supplied image at the supplied scale

    :param image: the image to save
    :param file_name: the input file name
    :param max_size: the maximum size of the width or height of the image
    :param tag: a tag to include in the file name
    """

    output_dir = os.path.dirname(file_name)
    file_name_base, extension = os.path.splitext(os.path.basename(file_name))

    output_file = os.path.join(
        output_dir, f'{file_name_base}.{tag}{extension}')

    scale = max_size / max(image.width, image.height)
    width = int(scale * image.width)
    height = int(scale * image.height)
    image.thumbnail((width, height))
    image.save(output_file)


def _generate_image_preview(image_file: str):
    """
    Generates a down-sized copy of the supplied image

    :param image_file: the path to the image file
    """

    with Image.open(image_file) as image:

        # Blur the full image
        max_size = max(image.width, image.height)
        preview = image.filter(ImageFilter.GaussianBlur(
            radius=max(2, int(max_size * PREVIEW_BLUR_AMOUNT))
        ))

        _save_resized_image(preview,
                            image_file,
                            MAX_PREVIEW_IMAGE_SIZE,
                            'preview')


def _generate_resised_image(image_file: str,
                            max_size: int,
                            tag: str):
    """
    Save the supplied image at the supplied scale

    :param image_file: the input file name
    :param max_size: the maximum size of the width or height of the image
    :param tag: a tag to include in the file name
    """

    with Image.open(image_file) as image:
        _save_resized_image(image,
                            image_file,
                            max_size,
                            tag)


def main():
    """
    Downloads the content from Google Drive
    """

    args = _parse_command_line_arguments()
    print('Authenticating with Google Drive')
    print(args.credentials_file)
    credentials = service_account.Credentials.from_service_account_file(
        args.credentials_file)

    print('Searching Google Drive for content')
    service = _drive_service(credentials)
    items = _get_drive_items(service)

    print('Creating output directory')
    print(args.output_dir)
    os.makedirs(args.output_dir, exist_ok=True)

    print('Downloading contact details')
    contact_details = _get_contact_details(service, items)
    _write_json_file(contact_details, args.output_dir, 'contact.json')

    print('Downloading content for home page')
    home = _get_home_content(service, items)
    _write_json_file(home, args.output_dir, 'home.json')

    print('Downloading content for portfolio page')
    portfolio = _get_portfolio_content(items)
    _write_json_file(portfolio, args.output_dir, 'portfolio.json')

    print('Downloading content for video page')
    video = _get_video_content(items)
    _write_json_file(video, args.output_dir, 'video.json')

    print('Downloading media & creating previews')
    media = []
    media += [
        media_item
        for media_item in home['photos']
    ]
    media += [
        media_item
        for photos in portfolio['photos'].values()
        for media_item in photos
    ]
    media += [
        media_item
        for media_item in video['videos']
    ]

    for media_item in media:
        print(f"{media_item['file_id']}: {media_item['description']}")
        print('- Downloading')
        file_path = _download_media(service,
                                    media_item['file_id'],
                                    media_item['extension'],
                                    int(media_item['size']),
                                    media_item['sha256'],
                                    args.output_dir)

        if items[media_item['file_id']].item_type == DriveItemType.IMAGE:
            print('- Resizing')
            _generate_image_preview(file_path)
            _generate_resised_image(file_path, MAX_MEDIUM_IMAGE_SIZE, 'medium')
            _generate_resised_image(file_path, MAX_LARGE_IMAGE_SIZE, 'large')


if __name__ == '__main__':
    main()
